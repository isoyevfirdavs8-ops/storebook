import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "./OrderDetailPage.css";

export default function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/orders/${id}/`);
      setOrder(response.data);
    } catch (err) {
      console.error("Order detail error:", err);

      if (err.response?.status === 401) {
        setError("Buyurtmani ko‘rish uchun tizimga kiring.");
      } else if (err.response?.status === 404) {
        setError("Buyurtma topilmadi.");
      } else {
        setError("Buyurtmani yuklashda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
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
      hour: "2-digit",
      minute: "2-digit",
    });
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
      processing: {
        label: "Tayyorlanmoqda",
        className: "processing",
      },
      shipping: {
        label: "Yetkazilmoqda",
        className: "shipping",
      },
      delivered: {
        label: "Yetkazib berildi",
        className: "delivered",
      },
      cancelled: {
        label: "Bekor qilingan",
        className: "cancelled",
      },
    };

    return (
      statuses[status] || {
        label: status || "Noma'lum",
        className: "pending",
      }
    );
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="detail-loading">
            Buyurtma yuklanmoqda...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="detail-error">
            <div className="detail-error-icon">!</div>

            <h2>{error}</h2>

            <Link to="/my-orders">
              ← Buyurtmalarimga qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const status = getStatus(order.status);

  const items = order.items || order.order_items || [];

  const total =
    order.total_price ??
    order.total ??
    order.amount ??
    0;

  return (
    <div className="order-detail-page">
      <div className="container">

        {/* Back */}
        <Link to="/my-orders" className="back-orders">
          ← Buyurtmalarim
        </Link>

        {/* Header */}
        <div className="detail-header">

          <div>
            <span className="detail-label">
              Buyurtma tafsilotlari
            </span>

            <h1>
              #{order.order_number || order.id}
            </h1>

            <p>
              {formatDate(
                order.created_at || order.created
              )}
            </p>
          </div>

          <div className={`detail-status ${status.className}`}>
            <span></span>
            {status.label}
          </div>

        </div>

        <div className="detail-layout">

          {/* LEFT */}
          <div className="detail-main">

            {/* Products */}
            <div className="detail-card">

              <div className="detail-card-header">
                <h2>Buyurtma tarkibi</h2>

                <span>
                  {items.length} ta mahsulot
                </span>
              </div>

              <div className="products-list">

                {items.map((item, index) => {
                  const productName = item.book_title || "Kitob";
                  const image = item.book_cover;
                  const quantity = item.quantity || 1;
                  const price = item.price || 0;

                  return (
                    <div
                      className="order-product"
                      key={item.id || index}
                    >
                      <div className="product-image">
                        {image ? (
                          <img
                            src={image}
                            alt={productName}
                          />
                        ) : (
                          <div className="no-image">
                            📚
                          </div>
                        )}
                      </div>

                      <div className="product-info">
                        <h3>{productName}</h3>

                        <span>
                          Miqdor: {quantity} ta
                        </span>
                      </div>

                      <div className="product-price">
                        {formatPrice(price * quantity)}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Delivery */}
            <div className="detail-card">

              <div className="detail-card-header">
                <h2>Yetkazib berish ma'lumotlari</h2>
              </div>

              <div className="delivery-info">

                <div>
                  <span>Ism</span>
                  <strong>
                    {order.full_name ||
                      order.name ||
                      order.user_name ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Telefon</span>
                  <strong>
                    {order.phone_number ||
                      order.phone ||
                      "—"}
                  </strong>
                </div>

                <div className="full-width">
                  <span>Manzil</span>
                  <strong>
                    {order.address || "—"}
                  </strong>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT */}
          <aside className="detail-sidebar">

            <div className="summary-card">

              <h2>Buyurtma summasi</h2>

              <div className="summary-row">
                <span>Mahsulotlar</span>

                <strong>
                  {formatPrice(
                    order.subtotal ||
                    order.products_total ||
                    total
                  )}
                </strong>
              </div>

              <div className="summary-row">
                <span>Yetkazib berish</span>

                <strong>
                  {formatPrice(
                    order.delivery_price ||
                    order.delivery_cost ||
                    0
                  )}
                </strong>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Jami</span>

                <strong>
                  {formatPrice(total)}
                </strong>
              </div>

            </div>

            <div className="status-card">

              <h2>Buyurtma holati</h2>

              <div className="status-line active">
                <span className="timeline-dot"></span>

                <div>
                  <strong>
                    {status.label}
                  </strong>

                  <small>
                    Buyurtma holati
                  </small>
                </div>
              </div>

            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}