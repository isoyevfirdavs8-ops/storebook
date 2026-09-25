
import "./MyOrderPage.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function MyOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/");
      setOrders(response.data.results || response.data || []);
    } catch (err) {
      console.error("Orders error:", err);

      if (err.response?.status === 401) {
        setError("Buyurtmalarni ko‘rish uchun tizimga kiring.");
      } else {
        setError("Buyurtmalarni yuklashda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (status) => {
    const statuses = {
      pending: {
        label: "Kutilmoqda",
        className: "pending",
      },

      confirmed: {
        label: "Tasdiqlangan",
        className: "confirmed",
      },

      shipped: {
        label: "Yetkazilmoqda",
        className: "shipping",
      },

      delivered: {
        label: "Yetkazib berilgan",
        className: "delivered",
      },

      cancelled: {
        label: "Bekor qilingan",
        className: "cancelled",
      },
    };

    return (
      statuses[status] || {
        label: status || "Noma’lum",
        className: "pending",
      }
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("uz-UZ").format(price || 0) + " so'm";
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="container">
          <div className="orders-header">
            <div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-subtitle"></div>
            </div>
          </div>

          <div className="orders-list">
            {[1, 2, 3].map((item) => (
              <div className="order-card skeleton-card" key={item}>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line short"></div>
                <div className="skeleton skeleton-line"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="container">

        {/* Header */}
        <div className="orders-header">
          <div>
            <h1>Buyurtmalarim</h1>
            <p>
              Barcha buyurtmalaringizni shu yerda boshqaring
            </p>
          </div>

          <div className="orders-count">
            <span>{orders.length}</span>
            <small>buyurtma</small>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="orders-error">
            <div className="error-icon">
              !
            </div>

            <div>
              <strong>Xatolik yuz berdi</strong>
              <p>{error}</p>
            </div>

            <button onClick={fetchOrders}>
              Qayta urinish
            </button>
          </div>
        )}

        {/* Empty */}
        {!error && orders.length === 0 && (
          <div className="empty-orders">
            <div className="empty-icon">
              🛍️
            </div>

            <h2>Hozircha buyurtmalaringiz yo‘q</h2>

            <p>
              Siz hali hech qanday mahsulot buyurtma qilmagansiz.
            </p>

            <Link to="/" className="shop-button">
              Xarid qilish
            </Link>
          </div>
        )}

        {/* Orders */}
        {!error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const status = getStatus(order.status);

              return (
                <div className="order-card" key={order.id}>

                  {/* Top */}
                  <div className="order-top">
                    <div className="order-info">
                      <span className="order-label">
                        Buyurtma
                      </span>

                      <h3>
                        #{order.order_number || order.id}
                      </h3>
                    </div>

                    <div
                      className={`order-status ${status.className}`}
                    >
                      <span className="status-dot"></span>
                      {status.label}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="order-divider"></div>

                  {/* Content */}
                  <div className="order-content">
                    <div className="order-meta">

                      <div className="meta-item">
                        <span className="meta-icon">
                          📅
                        </span>

                        <div>
                          <small>Sana</small>
                          <strong>
                            {formatDate(
                              order.created_at ||
                              order.created
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="meta-item">
                        <span className="meta-icon">
                          📦
                        </span>

                        <div>
                          <small>Mahsulotlar</small>
                          <strong>
                            {order.items_count ??
                              order.items?.length ??
                              0}{" "}
                            ta
                          </strong>
                        </div>
                      </div>

                      <div className="meta-item">
                        <span className="meta-icon">
                          💰
                        </span>

                        <div>
                          <small>Jami summa</small>
                          <strong className="order-price">
                            {formatPrice(
                              order.total_price ??
                              order.total ??
                              order.amount
                            )}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* Books */}
                    {order.items?.length > 0 && (
                      <div className="order-books">
                        {order.items.map((item, index) => (
                          <div className="order-book" key={item.book || index}>
                            <div className="order-book-image">
                              {item.book_cover ? (
                                <img
                                  src={item.book_cover}
                                  alt={item.book_title}
                                />
                              ) : (
                                <div className="no-book-image">
                                  📚
                                </div>
                              )}
                            </div>

                            <div className="order-book-info">
                              <h4>{item.book_title}</h4>

                              <div className="order-book-details">
                                <span>
                                  {item.quantity} dona
                                </span>

                                <strong>
                                  {formatPrice(item.price)}
                                </strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Button */}
                    <Link
                      to={`/orders/${order.id}`}
                      className="order-detail-button"
                    >
                      Batafsil
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

