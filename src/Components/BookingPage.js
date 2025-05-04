import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [hoveredBookingId, setHoveredBookingId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaint, setComplaint] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      const email = localStorage.getItem("email");
      try {
        const res = await axios.get(
          `${BASE_URL}/api/users/customer/bookings/${email}`
        );
        const users = res.data;
        const allBookings = users.flatMap((user) =>
          user.bookings.map((booking) => ({
            _id: booking._id,
            transactionId: booking.transactionId,
            customerName: booking.name,
            serviceName: booking.service,
            bookingDate: booking.date,
            bookingTime: booking.time,
            status: booking.paymentStatus,
            parlorName: booking.parlorName,
            totalAmount: booking.total_amount,
            PaidAmount: booking.amount,
            RemainingAmount: booking.total_amount - booking.amount,
            paymentMode: booking.Payment_Mode,
            relatedServices: booking.relatedServices?.join(", "),
            bookingId: booking.bookingId || booking._id,
            rating: booking.userRating || null,
            comment: booking.userReview || null,
            orderId: booking.orderId,
            pin: booking.pin,
            complaint: booking.userComplaint || null,
            confirmed: booking.confirmed,
            refundedAmount: booking.refundedAmount || 0,
            upiId: booking.upiId || null,
            refundStatus: booking.refundStatus || "NONE",
          }))
        );
        setBookings(allBookings.reverse());
        setFilteredBookings(allBookings.reverse());
      } catch (error) {
        alert("Failed to fetch bookings. Please try again.");
      }
    };

    fetchBookings();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredBookings(bookings.reverse());
    } else {
      setFilteredBookings(
        bookings.filter(
          (booking) =>
            booking.status?.toLowerCase() === filterStatus.toLowerCase()
        )
      );
    }
  }, [filterStatus, bookings]);

  useEffect(() => {
    if (!isMobile || !hoveredBookingId) return;

    const handleClickOutside = (event) => {
      const ratingContainer = document.querySelector(
        `.rating-container[data-booking-id="${hoveredBookingId}"]`
      );
      const commentPopup = document.querySelector(
        `.comment-popup[data-booking-id="${hoveredBookingId}"]`
      );
      const complaintContainer = document.querySelector(
        `.complaint-container[data-booking-id="${hoveredBookingId}"]`
      );
      const complaintPopup = document.querySelector(
        `.complaint-popup[data-booking-id="${hoveredBookingId}"]`
      );

      if (
        !ratingContainer?.contains(event.target) &&
        !commentPopup?.contains(event.target) &&
        !complaintContainer?.contains(event.target) &&
        !complaintPopup?.contains(event.target)
      ) {
        setHoveredBookingId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobile, hoveredBookingId]);

  const getStatusColor = (status) => {
    if (!status) return "#0e0f0f";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "completed" || lowerStatus === "paid")
      return "#201548";
    if (lowerStatus === "pending") return "#FFC107";
    if (lowerStatus === "cancelled") return "#F44336";
    return "#0e0f0f";
  };

  const getRefundStatusColor = (refundStatus) => {
    if (!refundStatus) return "#0e0f0f";
    const lowerStatus = refundStatus.toLowerCase();
    if (lowerStatus === "pending") return "#FFC107";
    if (lowerStatus === "approved") return "#201548";
    if (lowerStatus === "rejected") return "#F44336";
    if (lowerStatus === "none") return "#0e0f0f";
    return "#0e0f0f";
  };

  const isFutureDate = (bookingDate) => {
    if (!bookingDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const booking = new Date(bookingDate);
    booking.setHours(0, 0, 0, 0);
    return booking > today;
  };

  const isPastDate = (bookingDate) => {
    if (!bookingDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const booking = new Date(bookingDate);
    booking.setHours(0, 0, 0, 0);
    return booking < today;
  };

  const openModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setRating(0);
    setComment("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
    setRating(0);
    setComment("");
  };

  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setUpiId("");
    setUpiError("");
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedBookingId(null);
    setUpiId("");
    setUpiError("");
  };

  const openComplaintModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setComplaint("");
    setIsComplaintModalOpen(true);
  };

  const closeComplaintModal = () => {
    setIsComplaintModalOpen(false);
    setSelectedBookingId(null);
    setComplaint("");
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === "modal") {
      closeModal();
      closeComplaintModal();
      closeCancelModal();
    }
  };

  const handleRating = (star) => {
    setRating(star);
  };

  const validateUpiId = (upi) => {
    const upiRegex = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/;
    return upiRegex.test(upi);
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;

    const selectedBooking = bookings.find(
      (booking) => booking._id === selectedBookingId
    );
    if (!selectedBooking) return;

    const isAdvancePayment =
      selectedBooking.PaidAmount === selectedBooking.totalAmount * 0.25;

    if (
      !isAdvancePayment &&
      selectedBooking.PaidAmount === selectedBooking.totalAmount
    ) {
      if (!validateUpiId(upiId)) {
        setUpiError("Please enter a valid UPI ID (e.g., name@bank)");
        return;
      }
    }

    try {
      const email = localStorage.getItem("email");
      const response = await axios.post(
        `${BASE_URL}/api/users/cancel/booking`,
        {
          email,
          orderId: selectedBooking.orderId,
          upiId:
            !isAdvancePayment &&
            selectedBooking.PaidAmount === selectedBooking.totalAmount
              ? upiId
              : null,
        }
      );

      if (response.status === 200) {
        setBookings(
          bookings.map((booking) =>
            booking._id === selectedBookingId
              ? {
                  ...booking,
                  status: "CANCELLED",
                  confirmed: "Cancelled",
                  refundedAmount: isAdvancePayment
                    ? 0
                    : response.data.refundedAmount,
                  upiId: isAdvancePayment ? null : response.data.upiId,
                  refundStatus: isAdvancePayment ? "NONE" : "PENDING",
                }
              : booking
          )
        );
        alert(
          `Booking cancelled successfully. ${
            isAdvancePayment
              ? "No refund applicable for advance payment."
              : `Refund of ₹${response.data.refundedAmount} is pending approval.`
          }`
        );
        closeCancelModal();
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel booking. Please try again."
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedBookingId) return;

    const email = localStorage.getItem("email");
    const selectedBooking = bookings.find(
      (booking) => booking._id === selectedBookingId
    );
    if (!selectedBooking) return;

    try {
      const SP = await axios.get(`${BASE_URL}/api/admin/all/admins/data`);
      const emails = [...new Set(SP.data.map((admin) => admin.email))];
      const ratingArray = await axios.get(
        `${BASE_URL}/api/users/get/userRatings`
      );
      const ratingsData = ratingArray.data.ratings;
      const updatePromises = [];

      for (const parlorEmail of emails) {
        if (ratingsData[parlorEmail]) {
          const ratings = ratingsData[parlorEmail];
          const totalRatings = ratings.reduce(
            (total, rating) => total + rating,
            0
          );
          const avgRating = totalRatings / ratings.length;
          const countPeople = ratings.length;
          updatePromises.push(
            axios.post(`${BASE_URL}/api/users/update/spRating`, {
              parlorEmail,
              avgRating,
              countPeople,
            })
          );
        }
      }

      await Promise.all(updatePromises);

      const response = await axios.post(
        `${BASE_URL}/api/users/update/booking/rating`,
        {
          email,
          orderId: selectedBooking.orderId,
          userRating: rating,
          userReview: comment,
        }
      );

      if (response.status === 200) {
        setBookings(
          bookings.map((booking) =>
            booking._id === selectedBookingId
              ? { ...booking, rating, comment }
              : booking
          )
        );
        alert("Rating submitted successfully.");
        closeModal();
      }
    } catch (error) {
      alert("Failed to submit rating. Please try again.");
    }
  };

  const handleRatingClick = (bookingId) => {
    if (isMobile) {
      setHoveredBookingId(hoveredBookingId === bookingId ? null : bookingId);
    }
  };

  const handleComplaintSubmit = async () => {
    if (!selectedBookingId || !complaint) {
      alert("Please provide a complaint.");
      return;
    }

    const email = localStorage.getItem("email");
    const selectedBooking = bookings.find(
      (booking) => booking._id === selectedBookingId
    );
    if (!selectedBooking) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/update/booking/complaint`,
        {
          email,
          orderId: selectedBooking.orderId,
          userComplaint: complaint,
        }
      );

      if (response.status === 200) {
        setBookings(
          bookings.map((booking) =>
            booking._id === selectedBookingId
              ? { ...booking, complaint }
              : booking
          )
        );
        alert("Complaint submitted successfully.");
        closeComplaintModal();
      }
    } catch (error) {
      alert("Failed to submit complaint. Please try again.");
    }
  };

  const handleComplaintClick = (bookingId) => {
    if (isMobile) {
      setHoveredBookingId(hoveredBookingId === bookingId ? null : bookingId);
    }
  };

  const handlePaidBookings = () => {
    setFilterStatus("paid");
  };

  const handlePendingBookings = () => {
    setFilterStatus("pending");
  };

  const handleAllBookings = () => {
    setFilterStatus("all");
  };

  return (
    <div
      style={{
        padding: "1rem",
        minHeight: "100vh",
        background: "#ffffff",
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: #ffffff;
            padding: 1.5rem;
            border-radius: 10px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.3s ease-out;
          }
          .star-rating {
            display: flex;
            justify-content: center;
            margin-bottom: 1rem;
          }
          .star {
            font-size: 1.5rem;
            color: #ccc;
            cursor: pointer;
            transition: color 0.2s;
          }
          .star.filled {
            color: #201548;
          }
          .modal-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
          }
          .modal-buttons button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          }
          .modal-buttons .post-btn {
            background: #201548;
            color: #ffffff;
          }
          .modal-buttons .post-btn:hover {
            background: #1a1138;
            transform: translateY(-2px);
          }
          .modal-buttons .cancel-btn {
            background: #F44336;
            color: #ffffff;
          }
          .modal-buttons .cancel-btn:hover {
            background: #d32f2f;
            transform: translateY(-2px);
          }
          .error-text {
            color: #F44336;
            font-size: 0.8rem;
            margin-top: 0.2rem;
          }
          input[type="text"] {
            width: 100%;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 0.9rem;
            color: #0e0f0f;
          }
          textarea {
            width: 100%;
            min-height: 80px;
            resize: vertical;
            margin-bottom: 1rem;
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 0.9rem;
            color: #0e0f0f;
          }
          .rating-container, .complaint-container {
            position: relative;
            display: inline-block;
          }
          .comment-popup, .complaint-popup {
            position: absolute;
            background: #ffffff;
            padding: 0.8rem;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 100;
            max-width: 150px;
            white-space: normal;
            top: -100%;
            left: 50%;
            transform: translate(-50%, -100%);
            font-size: 0.8rem;
            color: #0e0f0f;
          }
          @media (min-width: 769px) {
            .comment-popup, .complaint-popup {
              display: none;
            }
            .rating-container:hover .comment-popup,
            .complaint-container:hover .complaint-popup {
              display: block;
            }
          }
          @media (max-width: 768px) {
            .comment-popup, .complaint-popup {
              display: ${hoveredBookingId ? "block" : "none"};
            }
          }
          .filter-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
            justify-content: center;
          }
          .filter-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #201548;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            flex: 1;
            text-align: center;
            max-width: 150px;
            background: #ffffff;
            color: #201548;
          }
          .filter-btn.active {
            background: #201548;
            color: #ffffff;
          }
          .filter-btn:hover {
            background: #201548;
            color: #ffffff;
            transform: translateY(-2px);
          }
          .table-container {
            width: 100%;
            overflow-x: auto;
            background: #ffffff;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            padding: 1rem;
            margin-top: 1rem;
            animation: fadeIn 0.8s ease-out;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
          }
          th, td {
            padding: 0.8rem;
            text-align: left;
            border-bottom: 1px solid #e8ecef;
            white-space: normal;
            word-wrap: break-word;
            font-size: 0.9rem;
          }
          th {
            font-weight: 600;
            letter-spacing: 0.5px;
            color: #0e0f0f;
          }
          td {
            color: #0e0f0f;
            font-weight: 500;
          }
          tr:hover {
            background: rgba(32, 21, 72, 0.1);
            transform: scale(1.005);
          }
          .secret-pin-paid {
            color: #201548;
            font-weight: 600;
          }
          .refund-status {
            font-weight: 600;
          }
          .action-cancel {
            cursor: pointer;
            color:rgb(34, 20, 9);
            display: flex;
            align-items: center;
            gap: 0.3rem;
                 background:rgb(224, 41, 41);
                 padding: 0.2rem;
                 border-radius: 5px;
          }
          .action-cancel i {
            color:rgb(38, 23, 11);
       
          }
          .action-cancel:hover {
            color: #1a1138;
          }
          .action-cancel:hover i {
            color: #1a1138;
          }
          .action-disabled {
            color: #ccc;
          }
          @media (max-width: 768px) {
            .table-container {
              padding: 0.5rem;
            }
            th, td {
              padding: 0.5rem;
              font-size: 0.8rem;
            }
            th:nth-child(4), td:nth-child(4),
            th:nth-child(10), td:nth-child(10),{
              display: none;
            }
            .filter-btn {
              font-size: 0.8rem;
              padding: 0.4rem 0.8rem;
              max-width: 120px;
            }
          }
          @media (max-width: 600px) {
            table, thead, tbody, th, td, tr {
              display: block;
            }
            thead {
              display: none;
            }
            tr {
              margin-bottom: 1rem;
              border: 1px solid #e8ecef;
              border-radius: 8px;
              background: #ffffff;
              padding: 0.5rem;
            }
            td {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem;
              font-size: 0.8rem;
              border: none;
              position: relative;
              color: #0e0f0f;
            }
            td::before {
              content: attr(data-label);
              font-weight: 600;
              color: #201548;
              flex: 1;
              padding-right: 0.5rem;
            }
            td:not(:last-child) {
              border-bottom: 1px solid #e8ecef;
            }
            td:nth-child(4),
            td:nth-child(10),{
              display: none;
            }
            .table-container {
              padding: 0.5rem;
            }
            .filter-buttons {
              flex-direction: column;
              gap: 0.3rem;
            }
            .filter-btn {
              font-size: 0.75rem;
              padding: 0.3rem;
              max-width: none;
            }
            .modal-content {
              padding: 1rem;
              max-width: 95%;
            }
            .star {
              font-size: 1.2rem;
            }
            .modal-buttons button {
              font-size: 0.8rem;
              padding: 0.4rem 0.8rem;
            }
            textarea, input[type="text"] {
              font-size: 0.8rem;
              min-height: 60px;
            }
          }
        `}
      </style>

      <div className="filter-buttons mt-5">
        <button
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={handleAllBookings}
        >
          All Bookings
        </button>
        <button
          className={`filter-btn ${filterStatus === "paid" ? "active" : ""}`}
          onClick={handlePaidBookings}
        >
          Confirmed Bookings
        </button>
        <button
          className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
          onClick={handlePendingBookings}
        >
          Failures Bookings
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr style={{ background: "#e8ecef", color: "#0e0f0f" }}>
              <th style={headerCellStyle}>S.No</th>
              <th style={headerCellStyle}>Booking ID</th>
              <th style={headerCellStyle}>Transaction ID</th>
              <th style={headerCellStyle}>Service</th>
              <th style={headerCellStyle}>Related Services</th>
              <th style={headerCellStyle}>Date</th>
              <th style={headerCellStyle}>Time</th>
              <th style={headerCellStyle}>Parlor Name</th>
              <th style={headerCellStyle}>Paid Amount</th>
              <th style={headerCellStyle}>Remaining Amount</th>
              <th style={headerCellStyle}>Complaint</th>
              <th style={headerCellStyle}>Rating</th>
              <th style={headerCellStyle}>Refund Status</th>
              <th style={headerCellStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <tr
                  key={booking._id}
                  style={{
                    transition: "all 0.3s ease",
                    ...(index % 2 === 1 && {
                      background: "rgba(32, 21, 72, 0.05)",
                    }),
                  }}
                >
                  <td style={tableCellStyle} data-label="S.No">
                    {index + 1}
                  </td>
                  <td style={tableCellStyle} data-label="Booking ID">
                    {booking.bookingId || "NA"}
                  </td>
                  <td style={tableCellStyle} data-label="Transaction ID">
                    {booking.transactionId || "NA"}
                  </td>
                  <td style={tableCellStyle} data-label="Service">
                    {booking.serviceName || "NA"}
                  </td>
                  <td style={tableCellStyle} data-label="Related Services">
                    {booking.relatedServices || "NA"}
                  </td>
                  <td style={tableCellStyle} data-label="Date">
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString()
                      : "NA"}
                  </td>
                  <td
                    style={{ ...tableCellStyle, whiteSpace: "nowrap" }}
                    data-label="Time"
                  >
                    {booking.bookingTime || "NA"}
                  </td>
                  <td style={tableCellStyle} data-label="Parlor Name">
                    {booking.parlorName || "NA"}
                  </td>
                  <td style={tableCellStyle} data-label="Paid Amount">
                    {booking.status?.toLowerCase() === "pending"
                      ? "N/A"
                      : booking.PaidAmount || "NA"}
                  </td>
                  <td style={tableCellStyle} data-label="Remaining Amount">
                    {booking.status?.toLowerCase() === "pending"
                      ? "N/A"
                      : booking.RemainingAmount || "0"}
                  </td>
                  <td style={tableCellStyle} data-label="Complaint">
                    {booking.complaint ? (
                      <div
                        className="complaint-container"
                        data-booking-id={booking._id}
                        onMouseEnter={() =>
                          !isMobile && setHoveredBookingId(booking._id)
                        }
                        onMouseLeave={() =>
                          !isMobile && setHoveredBookingId(null)
                        }
                        onClick={() => handleComplaintClick(booking._id)}
                      >
                        View{" "}
                        <i
                          className="fa-solid fa-eye"
                          style={{ color: "#201548" }}
                        ></i>
                        {hoveredBookingId === booking._id &&
                          booking.complaint && (
                            <div
                              className="complaint-popup"
                              data-booking-id={booking._id}
                            >
                              {booking.complaint}
                            </div>
                          )}
                      </div>
                    ) : booking.status?.toLowerCase() === "pending" ? (
                      <span style={{ color: "#ccc" }}>
                        <i
                          className="fa-solid fa-pen-to-square"
                          style={{ color: "#ccc", fontSize: "20px" }}
                        ></i>
                      </span>
                    ) : isPastDate(booking.bookingDate) ? (
                      <span
                        onClick={() => openComplaintModal(booking._id)}
                        style={{ cursor: "pointer", color: "#201548" }}
                      >
                        <i
                          className="fa-solid fa-pen-to-square"
                          style={{ color: "#201548", fontSize: "20px" }}
                        ></i>
                      </span>
                    ) : (
                      <span style={{ color: "#ccc" }}>
                        <i
                          className="fa-solid fa-pen-to-square"
                          style={{ color: "#ccc", fontSize: "20px" }}
                        ></i>
                      </span>
                    )}
                  </td>
                  <td style={tableCellStyle} data-label="Rating">
                    {booking.rating ? (
                      <div
                        className="rating-container"
                        data-booking-id={booking._id}
                        onMouseEnter={() =>
                          !isMobile && setHoveredBookingId(booking._id)
                        }
                        onMouseLeave={() =>
                          !isMobile && setHoveredBookingId(null)
                        }
                        onClick={() => handleRatingClick(booking._id)}
                      >
                        {booking.rating}{" "}
                        <i
                          className="fa-solid fa-star"
                          style={{ color: "#201548" }}
                        ></i>
                        {hoveredBookingId === booking._id &&
                          booking.comment && (
                            <div
                              className="comment-popup"
                              data-booking-id={booking._id}
                            >
                              {booking.comment}
                            </div>
                          )}
                      </div>
                    ) : booking.status?.toLowerCase() === "pending" ? (
                      <span style={{ color: "#ccc" }}>
                        Rate{" "}
                        <i
                          className="fa-regular fa-star"
                          style={{ color: "#ccc" }}
                        ></i>
                      </span>
                    ) : isPastDate(booking.bookingDate) ? (
                      <span
                        onClick={() => openModal(booking._id)}
                        style={{ cursor: "pointer", color: "#201548" }}
                      >
                        Rate{" "}
                        <i
                          className="fa-regular fa-star"
                          style={{ color: "#201548" }}
                        ></i>
                      </span>
                    ) : (
                      <span style={{ color: "#ccc" }}>
                        Rate{" "}
                        <i
                          className="fa-regular fa-star"
                          style={{ color: "#ccc" }}
                        ></i>
                      </span>
                    )}
                  </td>
                  <td style={tableCellStyle} data-label="Refund Status">
                    <span
                      className="refund-status"
                      style={{
                        color: getRefundStatusColor(booking.refundStatus),
                      }}
                    >
                      {booking.refundStatus || "NA"}
                      {booking.refundedAmount > 0 &&
                        ` (₹${booking.refundedAmount})`}
                    </span>
                  </td>
                  <td style={tableCellStyle} data-label="Action">
                    {booking.status?.toLowerCase() === "paid" &&
                    booking.confirmed !== "Cancelled" &&
                    isFutureDate(booking.bookingDate) ? (
                      <span
                        className="action-cancel"
                        onClick={() => openCancelModal(booking._id)}
                      >
                        Cancel <i className="fa-solid fa-times-circle" />
                      </span>
                    ) : (
                      <span className="action-disabled">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="15"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#0e0f0f",
                    fontSize: "1.1rem",
                    background: "#ffffff",
                    display: "block",
                  }}
                >
                  No{" "}
                  {filterStatus === "paid"
                    ? "paid"
                    : filterStatus === "pending"
                    ? "pending"
                    : ""}{" "}
                  bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal" onClick={handleBackdropClick}>
          <div className="modal-content">
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1rem",
                fontSize: "1.2rem",
                color: "#0e0f0f",
              }}
            >
              Rate This Service
            </h3>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? "filled" : ""}`}
                  onClick={() => handleRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Add your comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="post-btn" onClick={handleSubmit}>
                Post
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isComplaintModalOpen && (
        <div className="modal" onClick={handleBackdropClick}>
          <div className="modal-content">
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1rem",
                fontSize: "1.2rem",
                color: "#0e0f0f",
              }}
            >
              File a Complaint
            </h3>
            <textarea
              placeholder="Describe your issue..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="post-btn" onClick={handleComplaintSubmit}>
                Submit
              </button>
              <button className="cancel-btn" onClick={closeComplaintModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isCancelModalOpen && (
        <div className="modal" onClick={handleBackdropClick}>
          <div className="modal-content">
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1rem",
                fontSize: "1.2rem",
                color: "#0e0f0f",
              }}
            >
              Cancel Booking
            </h3>
            <p
              style={{
                marginBottom: "1rem",
                fontSize: "0.9rem",
                color: "#0e0f0f",
              }}
            >
              {bookings.find((b) => b._id === selectedBookingId)?.PaidAmount ===
              bookings.find((b) => b._id === selectedBookingId)?.totalAmount *
                0.25
                ? "Advance payment (25%) detected. No refund will be processed."
                : `Full payment detected. 10% will be deducted from refund. Refund amount: ₹${(
                    bookings.find((b) => b._id === selectedBookingId)
                      ?.PaidAmount * 0.9
                  ).toFixed(2)}`}
            </p>
            {bookings.find((b) => b._id === selectedBookingId)?.PaidAmount ===
              bookings.find((b) => b._id === selectedBookingId)
                ?.totalAmount && (
              <>
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g., name@bank)"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setUpiError("");
                  }}
                />
                {upiError && <p className="error-text">{upiError}</p>}
              </>
            )}
            <div className="modal-buttons">
              <button className="post-btn" onClick={handleCancelBooking}>
                Confirm Cancellation
              </button>
              <button className="cancel-btn" onClick={closeCancelModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const headerCellStyle = {
  textAlign: "left",
  fontWeight: "600",
  letterSpacing: "0.5px",
  color: "#0e0f0f",
};

const tableCellStyle = {
  borderBottom: "1px solid #e8ecef",
  color: "#0e0f0f",
  fontWeight: "500",
};

export default BookingPage;
