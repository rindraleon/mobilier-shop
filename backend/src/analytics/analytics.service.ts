import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus, ProductStatus, UserRole } from '../common/enums';

export type PeriodKey =
  'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_year' | 'custom';

/** Statuts considérés comme du chiffre d'affaires réel. */
const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.READY,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Normalise un montant renvoyé par PostgreSQL.
 *
 * `SUM(...)::bigint` dépasse la capacité d'un INTEGER JavaScript sérialisable
 * de façon fiable : le pilote `pg` renvoie donc une **chaîne** (« 8990000 »).
 * Sans cette conversion, l'API exposerait des montants en `string` et le
 * frontend devrait deviner le type — source de bugs d'affichage et de tri.
 */
function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  /** Calcule la plage de dates à partir d'une clé de période. */
  resolveRange(period: PeriodKey = '30d', from?: string, to?: string): DateRange {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7d':
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case '30d':
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end.setTime(new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime());
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        start = from ? new Date(from) : new Date(0);
        end.setTime(to ? new Date(to).getTime() : now.getTime());
        break;
      default:
        start.setDate(start.getDate() - 29);
    }
    return { from: start, to: end };
  }

  /* ------------------------------ Admin dashboard ---------------------------- */

  async adminDashboard(period: PeriodKey = '30d', from?: string, to?: string) {
    const range = this.resolveRange(period, from, to);
    const revenueRow = await this.orders
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('o.status IN (:...statuses)', { statuses: REVENUE_STATUSES })
      .andWhere('o."created_at" BETWEEN :from AND :to', range)
      .getRawOne<{ revenue: string; orders: string }>();

    const [customers, sellers, pendingSellers, activeProducts, pendingPayments, inProgressOrders] =
      await Promise.all([
        this.users.count({ where: { role: UserRole.CUSTOMER } }),
        this.dataSource.query(
          `SELECT COUNT(*)::int AS count FROM sellers WHERE status = 'approved'`,
        ),
        this.dataSource.query(
          `SELECT COUNT(*)::int AS count FROM sellers WHERE status = 'pending'`,
        ),
        this.products.count({ where: { status: ProductStatus.PUBLISHED } }),
        this.dataSource.query(
          `SELECT COUNT(*)::int AS count FROM payments WHERE status = 'submitted'`,
        ),
        this.orders.count({
          where: [
            { status: OrderStatus.PAID },
            { status: OrderStatus.PROCESSING },
            { status: OrderStatus.READY },
          ],
        }),
      ]);

    const previous = this.previousRange(range, period);

    const previousRevenue = await this.orders
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'revenue')
      .where('o.status IN (:...statuses)', { statuses: REVENUE_STATUSES })
      .andWhere('o."created_at" BETWEEN :from AND :to', previous)
      .getRawOne<{ revenue: string }>();

    const current = Number(revenueRow?.revenue ?? 0);
    const before = Number(previousRevenue?.revenue ?? 0);

    return {
      period,
      range,
      revenue: current,
      orders: Number(revenueRow?.orders ?? 0),
      averageBasket:
        Number(revenueRow?.orders ?? 0) > 0 ? Math.round(current / Number(revenueRow?.orders)) : 0,
      customers,
      sellers: Number(sellers?.[0]?.count ?? 0),
      pendingSellers: Number(pendingSellers?.[0]?.count ?? 0),
      activeProducts,
      pendingPayments: Number(pendingPayments?.[0]?.count ?? 0),
      ordersInProgress: inProgressOrders,
      growth: {
        revenuePercent: before > 0 ? Math.round(((current - before) / before) * 1000) / 10 : null,
        previousRevenue: before,
      },
    };
  }

  private previousRange(range: DateRange, _period: PeriodKey): DateRange {
    const duration = range.to.getTime() - range.from.getTime();
    return {
      from: new Date(range.from.getTime() - duration - 1),
      to: new Date(range.from.getTime() - 1),
    };
  }

  /**
   * Chiffre d'affaires et commandes agrégés par jour.
   *
   * ATTENTION : `dataSource.query()` avec un tableau de paramètres délègue au
   * pilote `pg`, qui ne comprend que les marqueurs positionnels `$1…$n`.
   * Mélanger un marqueur nommé (`:sellerId`) avec `$1` provoquait une
   * `syntax error at or near ":"`. On reste donc intégralement positionnel.
   */
  async salesOverTime(period: PeriodKey = '30d', from?: string, to?: string, sellerId?: string) {
    const range = this.resolveRange(period, from, to);
    const params: unknown[] = [REVENUE_STATUSES, range.from, range.to];
    let sellerJoin = '';
    if (sellerId) {
      sellerJoin = 'INNER JOIN order_items oi ON oi."order_id" = o.id AND oi."seller_id" = $4';
      params.push(sellerId);
    }

    const rows = (await this.dataSource.query(
      `SELECT to_char(date_trunc('day', o."created_at"), 'YYYY-MM-DD') AS date,
              COALESCE(SUM(o.total), 0)::bigint AS revenue,
              COUNT(DISTINCT o.id)::int AS orders
         FROM orders o
         ${sellerJoin}
        WHERE o.status = ANY($1::orders_status_enum[])
          AND o."created_at" BETWEEN $2 AND $3
        GROUP BY 1
        ORDER BY 1 ASC`,
      params,
    )) as { date: string; revenue: number | string; orders: number }[];

    // SUM(...)::bigint est renvoyé en chaîne par le pilote pg : on normalise.
    return rows.map((row) => ({
      date: row.date,
      revenue: toNumber(row.revenue),
      orders: Number(row.orders ?? 0),
    }));
  }

  async topProducts(limit = 10, sellerId?: string) {
    const params: unknown[] = [REVENUE_STATUSES, limit];
    let where = 'WHERE o.status = ANY($1::orders_status_enum[])';
    if (sellerId) {
      where += ' AND oi."seller_id" = $3';
      params.push(sellerId);
    }
    const rows = (await this.dataSource.query(
      `SELECT oi."product_id" AS "productId",
              oi.name,
              SUM(oi.quantity)::int AS "unitsSold",
              SUM(oi."line_total")::bigint AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi."order_id"
         ${where}
        GROUP BY oi."product_id", oi.name
        ORDER BY "unitsSold" DESC
        LIMIT $2`,
      params,
    )) as { productId: string; name: string; unitsSold: number; revenue: number | string }[];

    return rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      unitsSold: Number(row.unitsSold ?? 0),
      revenue: toNumber(row.revenue),
    }));
  }

  async salesByCategory(period: PeriodKey = '30d') {
    const range = this.resolveRange(period);
    const rows = (await this.dataSource.query(
      `SELECT c.id AS "categoryId", c.name,
              COALESCE(SUM(oi."line_total"), 0)::bigint AS revenue,
              COALESCE(SUM(oi.quantity), 0)::int AS "unitsSold"
         FROM categories c
         LEFT JOIN products p ON p."category_id" = c.id AND p."deleted_at" IS NULL
         LEFT JOIN order_items oi ON oi."product_id" = p.id
         LEFT JOIN orders o ON o.id = oi."order_id" AND o.status = ANY($1::orders_status_enum[])
              AND o."created_at" BETWEEN $2 AND $3
        WHERE c."deleted_at" IS NULL
        GROUP BY c.id, c.name
        ORDER BY revenue DESC`,
      [REVENUE_STATUSES, range.from, range.to],
    )) as {
      categoryId: string;
      name: string;
      revenue: number | string;
      unitsSold: number;
    }[];

    return rows.map((row) => ({
      categoryId: row.categoryId,
      name: row.name,
      revenue: toNumber(row.revenue),
      unitsSold: Number(row.unitsSold ?? 0),
    }));
  }

  async salesBySeller(period: PeriodKey = '30d') {
    const range = this.resolveRange(period);
    const rows = (await this.dataSource.query(
      `SELECT s.id AS "sellerId", s."shop_name" AS "shopName",
              COALESCE(SUM(oi."line_total"), 0)::bigint AS revenue,
              COALESCE(SUM(oi.quantity), 0)::int AS "unitsSold",
              COUNT(DISTINCT o.id)::int AS orders
         FROM sellers s
         LEFT JOIN order_items oi ON oi."seller_id" = s.id
         LEFT JOIN orders o ON o.id = oi."order_id" AND o.status = ANY($1::orders_status_enum[])
              AND o."created_at" BETWEEN $2 AND $3
        WHERE s."deleted_at" IS NULL
        GROUP BY s.id, s."shop_name"
        ORDER BY revenue DESC`,
      [REVENUE_STATUSES, range.from, range.to],
    )) as {
      sellerId: string;
      shopName: string;
      revenue: number | string;
      unitsSold: number;
      orders: number;
    }[];

    return rows.map((row) => ({
      sellerId: row.sellerId,
      shopName: row.shopName,
      revenue: toNumber(row.revenue),
      unitsSold: Number(row.unitsSold ?? 0),
      orders: Number(row.orders ?? 0),
    }));
  }

  async ordersByStatus() {
    const rows = (await this.dataSource.query(
      `SELECT o.status, COUNT(*)::int AS count
         FROM orders o
        GROUP BY o.status
        ORDER BY count DESC`,
    )) as { status: OrderStatus; count: number }[];

    const result = {} as Record<OrderStatus, number>;
    for (const status of Object.values(OrderStatus)) result[status] = 0;
    for (const row of rows) result[row.status] = row.count;
    return result;
  }

  async customersAnalytics(period: PeriodKey = '30d') {
    const range = this.resolveRange(period);
    const newCustomers = await this.users
      .createQueryBuilder('u')
      .where('u."created_at" BETWEEN :from AND :to', range)
      .getCount();

    const topCustomers = await this.dataSource.query(
      `SELECT u.id, u.email,
              CONCAT(u."first_name", ' ', u."last_name") AS name,
              COALESCE(SUM(o.total), 0)::bigint AS revenue,
              COUNT(o.id)::int AS orders
         FROM users u
         JOIN orders o ON o."user_id" = u.id AND o.status = ANY($1::orders_status_enum[])
        GROUP BY u.id
        ORDER BY revenue DESC
        LIMIT 10`,
      [REVENUE_STATUSES],
    );

    return {
      newCustomers,
      topCustomers: (
        topCustomers as {
          id: string;
          email: string;
          name: string;
          revenue: number | string;
          orders: number;
        }[]
      ).map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        revenue: toNumber(row.revenue),
        orders: Number(row.orders ?? 0),
      })),
    };
  }

  /* ----------------------------- Seller dashboard ---------------------------- */

  async sellerDashboard(sellerId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const base = (from: Date) =>
      this.dataSource
        .query(
          `SELECT COALESCE(SUM(oi."line_total"), 0)::bigint AS revenue,
                COUNT(DISTINCT o.id)::int AS orders,
                COALESCE(SUM(oi.quantity), 0)::int AS "unitsSold"
           FROM order_items oi
           JOIN orders o ON o.id = oi."order_id" AND o.status = ANY($1::orders_status_enum[])
          WHERE oi."seller_id" = $2 AND o."created_at" >= $3`,
          [REVENUE_STATUSES, sellerId, from],
        )
        .then((rows: { revenue: number; orders: number; unitsSold: number }[]) => ({
          revenue: Number(rows?.[0]?.revenue ?? 0),
          orders: Number(rows?.[0]?.orders ?? 0),
          unitsSold: Number(rows?.[0]?.unitsSold ?? 0),
        }));

    const [today, month, total, products, activeProducts, lowStock, recentOrders] =
      await Promise.all([
        base(startOfDay),
        base(startOfMonth),
        base(new Date(0)),
        this.products.count({ where: { sellerId } }),
        this.products.count({ where: { sellerId, status: ProductStatus.PUBLISHED } }),
        this.products
          .createQueryBuilder('p')
          .where('p."seller_id" = :sellerId', { sellerId })
          .andWhere('p.stock <= COALESCE(p."low_stock_threshold", 5)')
          .getCount(),
        this.dataSource.query(
          `SELECT o.id, o."order_number" AS "orderNumber", o.status, o.total, o."created_at" AS "createdAt"
             FROM orders o
            WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi."order_id" = o.id AND oi."seller_id" = $1)
            ORDER BY o."created_at" DESC
            LIMIT 8`,
          [sellerId],
        ),
      ]);

    return {
      today,
      month,
      total,
      products: { total: products, active: activeProducts, lowStock },
      recentOrders,
    };
  }

  async sellerSales(sellerId: string, period: PeriodKey = '30d', from?: string, to?: string) {
    return this.salesOverTime(period, from, to, sellerId);
  }

  async sellerTopProducts(sellerId: string, limit = 10) {
    return this.topProducts(limit, sellerId);
  }

  async sellerOrdersStats(sellerId: string) {
    const rows = (await this.dataSource.query(
      `SELECT o.status, COUNT(DISTINCT o.id)::int AS count
         FROM orders o
         JOIN order_items oi ON oi."order_id" = o.id AND oi."seller_id" = $1
        GROUP BY o.status`,
      [sellerId],
    )) as { status: OrderStatus; count: number }[];
    const result = {} as Record<OrderStatus, number>;
    for (const status of Object.values(OrderStatus)) result[status] = 0;
    for (const row of rows) result[row.status] = row.count;
    return result;
  }
}
