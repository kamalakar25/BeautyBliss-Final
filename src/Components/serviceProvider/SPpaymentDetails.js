import React, { useState, useEffect, useCallback, useRef } from "react";
import "./SPpaymentDetails.css";
import debounce from "lodash/debounce";

const BASE_URL = process.env.REACT_APP_API_URL;

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const itemsPerPage = 5;
  const isMobile = screenWidth <= 768;
  const isVerySmallScreen = screenWidth <= 480;
  const tableContainerRef = useRef(null);

  // Update screenWidth on window resize
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize scroll position to left for mobile screens
  useEffect(() => {
    if (tableContainerRef.current && screenWidth <= 1439) {
      tableContainerRef.current.scrollLeft = 0;
    }
  }, [screenWidth, currentPage, bookings]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const email = localStorage.getItem("email");
        const response = await fetch(
          `${BASE_URL}/api/users/sp/bookings/${email}`
        );
        const data = await response.json();
        console.log("Fetched bookings:", data);
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilterText(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  // Handle input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Filter bookings based on specific fields
  const filteredBookings = [...bookings].reverse().filter((booking) =>
    [
      booking.transactionId,
      booking.customerName,
      booking.customerEmail,
      booking.service,
      booking.favoriteEmployee,
      booking.paymentStatus,
      booking.upiId,
      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "",
      booking.amount?.toString(),
      booking.refundedAmount?.toString(),
      booking.refundStatus,
    ].some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(filterText.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle refund action
  const openRefundModal = (booking) => {
    console.log("Selected booking for refund:", booking);
    setSelectedBooking(booking);
    setIsRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    setIsRefundModalOpen(false);
    setSelectedBooking(null);
  };

  const handleRefundAction = async (action) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/users/sp/refund/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: localStorage.getItem("email"),
            orderId: selectedBooking.orderId,
            action,
          }),
        }
      );

      if (response.ok) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.orderId === selectedBooking.orderId
              ? {
                  ...booking,
                  refundStatus: action === "accept" ? "APPROVED" : "REJECTED",
                }
              : booking
          )
        );
        alert(`Refund ${action}ed successfully`);
        closeRefundModal();
      } else {
        alert("Failed to process refund action");
      }
    } catch (error) {
      console.error("Error processing refund action:", error);
      alert("Error processing refund action");
    }
  };

  // Format date safely
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate)) {
        return parsedDate.toLocaleDateString();
      }
      return "N/A";
    } catch (e) {
      console.error("Invalid date format:", date);
      return "N/A";
    }
  };

  return (
    <div className="booking-page">
      <h2 className="page-title">All Bookings</h2>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by customer, email, service, transaction ID, UPI, date, amount, refund..."
          value={searchInput}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchInput && (
          <button
            onClick={() => {
              setSearchInput("");
              setFilterText("");
              debouncedSearch("");
              setCurrentPage(1);
            }}
            className="clear-btn"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="loading">Loading bookings...</div>
      ) : (
        <>
          <div className="bookings-table">
            {isMobile ? (
              <div className="mobile-bookings-list">
                {currentItems.length > 0 ? (
                  currentItems.map((booking, index) => (
                    <div key={index} className="booking-card">
                      <p className="booking-field">
                        <strong>S.No:</strong> {indexOfFirstItem + index + 1}
                      </p>
                      <p className="booking-field">
                        <strong>Transaction ID:</strong>{" "}
                        {booking.transactionId || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Customer:</strong> {booking.customerName || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Customer Email:</strong>{" "}
                        {booking.customerEmail || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Selected Employee:</strong>{" "}
                        {booking.favoriteEmployee || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Service:</strong> {booking.service || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Payment Date:</strong>{" "}
                        {formatDate(booking.createdAt)}
                      </p>
                      <p className="booking-field">
                        <strong>Payment Status:</strong>{" "}
                        {booking.paymentStatus || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Amount:</strong> {booking.amount || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Refund Amount:</strong>{" "}
                        {booking.refundedAmount || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>UPI ID:</strong> {booking.upiId || "N/A"}
                      </p>
                      <div className="booking-actions">
                        {booking.paymentStatus === "CANCELLED" &&
                        booking.refundedAmount > 0 &&
                        booking.refundStatus === "PENDING" ? (
                          <button
                            onClick={() => openRefundModal(booking)}
                            className="action-btn refund-btn"
                          >
                            Process Refund
                          </button>
                        ) : (
                          <span
                            className={`refund-status ${
                              booking.refundStatus === "APPROVED"
                                ? "approved"
                                : booking.refundStatus === "REJECTED"
                                ? "rejected"
                                : ""
                            }`}
                          >
                            {booking.refundStatus || "N/A"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-bookings">
                    {filterText
                      ? `No bookings found for "${filterText}"`
                      : "No bookings available"}
                  </div>
                )}
              </div>
            ) : (
              <div className="table-container" ref={tableContainerRef}>
                <table className="bookings-table-desktop">
                  <thead>
                    <tr>
                      <th className="table-header">S.No</th>
                      <th className="table-header no-wrap">Transaction ID</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Customer Email</th>
                      <th className="table-header">Selected Employee</th>
                      <th className="table-header">Service</th>
                      <th className="table-header">Payment Date</th>
                      <th className="table-header">Payment Status</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Refund Amount</th>
                      <th className="table-header no-wrap">UPI ID</th>
                      <th className="table-header">Refund Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((booking, index) => (
                        <tr key={index} className="table-row">
                          <td className="table-cell">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td
                            className="table-cell transaction-id"
                            data-tooltip={booking.transactionId || "N/A"}
                          >
                            {booking.transactionId || "N/A"}
                          </td>
                          <td className="table-cell">
                            {booking.customerName || "N/A"}
                          </td>
                          <td
                            className="table-cell customer-email"
                            data-tooltip={booking.customerEmail || "N/A"}
                          >
                            {booking.customerEmail || "N/A"}
                          </td>
                          <td className="table-cell">
                            {booking.favoriteEmployee || "N/A"}
                          </td>
                          <td className="table-cell">
                            {booking.service || "N/A"}
                          </td>
                          <td className="table-cell">
                            {formatDate(booking.createdAt)}
                          </td>
                          <td className="table-cell">
                            {booking.paymentStatus || "N/A"}
                          </td>
                          <td className="table-cell">
                            {booking.amount || "N/A"}
                          </td>
                          <td className="table-cell">
                            {booking.refundedAmount || "N/A"}
                          </td>
                          <td
                            className="table-cell upi-id"
                            data-tooltip={booking.upiId || "N/A"}
                          >
                            {booking.upiId || "N/A"}
                          </td>
                          <td className="table-cell refund-action">
                            {booking.paymentStatus === "CANCELLED" &&
                            booking.refundedAmount > 0 &&
                            booking.refundStatus === "PENDING" ? (
                              <button
                                onClick={() => openRefundModal(booking)}
                                className="action-btn refund-btn"
                              >
                                Process Refund
                              </button>
                            ) : (
                              <span
                                className={`refund-status ${
                                  booking.refundStatus === "APPROVED"
                                    ? "approved"
                                    : booking.refundStatus === "REJECTED"
                                    ? "rejected"
                                    : ""
                                }`}
                              >
                                {booking.refundStatus || "N/A"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="no-bookings">
                          {filterText
                            ? `No bookings found for "${filterText}"`
                            : "No bookings available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredBookings.length > itemsPerPage && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && selectedBooking && (
        <div className="modal-backdrop" onClick={closeRefundModal}>
          <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Process Refund</h3>
            <p className="modal-text">
              <strong>Customer:</strong> {selectedBooking.customerName || "N/A"}
            </p>
            <p className="modal-text">
              <strong>Service:</strong> {selectedBooking.service || "N/A"}
            </p>
            <p className="modal-text">
              <strong>Refund Amount:</strong>{" "}
              {selectedBooking.refundedAmount || "N/A"}
            </p>
            <p className="modal-text">
              <strong>UPI ID:</strong> {selectedBooking.upiId || "N/A"}
            </p>
            <div className="modal-actions">
              <button
                onClick={() => handleRefundAction("accept")}
                className="action-btn accept-btn"
              >
                Accept Refund
              </button>
              <button
                onClick={() => handleRefundAction("reject")}
                className="action-btn reject-btn"
              >
                Reject Refund
              </button>
            </div>
            <button onClick={closeRefundModal} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;