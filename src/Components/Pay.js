import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Alert,
  Chip,
} from "@mui/material";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

const Pay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    parlor,
    totalAmount,
    service,
    relatedServices,
    name,
    date,
    time,
    favoriteEmployee,
  } = location.state || {};

  const [paymentAmountOption, setPaymentAmountOption] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !totalAmount ||
      !name ||
      !service ||
      !date ||
      !time ||
      !favoriteEmployee
    ) {
      setError(
        "Missing booking details. Please start the booking process again."
      );
      setTimeout(() => navigate("/bookslot"), 3000);
    }
  }, [totalAmount, name, service, date, time, favoriteEmployee, navigate]);

  const handlePaymentAmountChange = (e) => {
    setPaymentAmountOption(e.target.value);
    setError("");
  };

  const calculatePaymentAmount = () => {
    if (!totalAmount) return 0;
    return paymentAmountOption === "25%" ? totalAmount * 0.25 : totalAmount;
  };

  const handleConfirm = async () => {
    if (!paymentAmountOption) {
      setError("Please select a payment amount (25% or Full).");
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      setError("Invalid total amount. Please try again.");
      return;
    }

    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    try {
      const userEmail = localStorage.getItem("email");
      if (!userEmail) {
        setError("User email not found. Please log in again.");
        return;
      }

      const bookingData = {
        parlorEmail: parlor.email,
        parlorName: parlor.name,
        name,
        date,
        time,
        service,
        amount: calculatePaymentAmount(),
        total_amount: totalAmount,
        relatedServices,
        favoriteEmployee,
        userEmail,
      };

      const response = await axios.post(
        `${BASE_URL}/api/razorpay/order`,
        bookingData
      );
      const { order, bookingId } = response.data;

      if (!order || !bookingId) {
        throw new Error("Failed to create order or booking");
      }

      const options = {
        key: "rzp_test_UlCC6Rw2IJrhyh",
        amount: order.amount,
        currency: order.currency,
        name: "Parlor Booking",
        description: `Payment for booking ${bookingId}`,
        order_id: order.id,
        handler: async function (response) {
          let pin = Math.floor(Math.random() * 90000) + 10000;
          try {
            const validationResponse = await axios.post(
              `${BASE_URL}/api/razorpay/order/validate`,
              {
                pin,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail,
                bookingId,
              }
            );
            navigate(
              `/payment/callback?order_id=${response.razorpay_order_id}`,
              {
                state: {
                  ...location.state,
                  bookingId,
                  paymentStatus: "PAID",
                  transactionId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  currency: order.currency,
                  amount: bookingData.amount,
                  total_amount: bookingData.total_amount,
                  Payment_Mode: validationResponse.data.paymentMethod || "UNKNOWN",
                  createdAt: new Date().toISOString(),
                },
              }
            );
          } catch (err) {
            setError(
              `Payment verification failed: ${
                err.response?.data?.error || err.message
              }`
            );
            navigate(
              `/payment/callback?order_id=${response.razorpay_order_id}`,
              {
                state: {
                  ...location.state,
                  bookingId,
                  paymentStatus: "FAILED",
                  transactionId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  failureReason:
                    err.response?.data?.reason || "Validation failed",
                  currency: order.currency,
                  amount: bookingData.amount,
                  total_amount: bookingData.total_amount,
                  Payment_Mode: "UNKNOWN",
                  createdAt: new Date().toISOString(),
                },
              }
            );
          }
        },
        prefill: {
          name,
          email: userEmail,
          contact: "9234567890",
        },
        notes: { bookingId, userEmail },
        theme: { color: "#4a3f8c" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        const failureReason = response.error.description || "Payment failed";
        setError(`Payment failed: ${failureReason}`);
        try {
          const errorResponse = await axios.post(
            `${BASE_URL}/api/razorpay/order/validate`,
            {
              razorpay_order_id: response.error.metadata.order_id,
              razorpay_payment_id: response.error.metadata.payment_id,
              razorpay_signature: "",
              userEmail,
              bookingId,
              failureReason,
            }
          );
        } catch (err) {
          // Error handling
        }
        navigate(
          `/payment/callback?order_id=${response.error.metadata.order_id}`,
          {
            state: {
              ...location.state,
              bookingId,
              paymentStatus: "FAILED",
              transactionId: response.error.metadata.payment_id,
              orderId: response.error.metadata.order_id,
              failureReason,
              currency: order.currency,
              amount: bookingData.amount,
              total_amount: bookingData.total_amount,
              Payment_Mode: "UNKNOWN",
              createdAt: new Date().toISOString(),
            },
          }
        );
      });
      rzp.open();

      setShowSuccess(true);
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(`Error processing request: ${errorMessage}`);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 1000,
        mx: "auto",
        backgroundColor: "#ffffff",
        borderRadius: 4,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": { boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" },
        display: "flex",
        flexDirection: "column",
        gap: 3,
        marginTop: "120px",
      }}
    >
      <h2
        className="fw-bold mb-4 animate_animated animate_fadeInDown"
        style={{
          animationDuration: "0.8s",
          fontSize: "2rem",
          letterSpacing: "1.2px", // Slightly increased for elegance
          fontWeight: 600,
          color: "#6683a8", 
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)", // Subtle depth
          fontFamily: "'Montserrat', sans-serif", // New font
        }}
      >
        Payment for Booking
      </h2>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {/* Booking Summary Section */}
        <Box
          sx={{
            flex: 1,
            minWidth: "48%",
            p: 4,
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
            color: "#333333",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
            border: "1px solid #4a3f8c",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#4a3f8c",
              mb: 2,
              textDecoration: "underline",
            }}
          >
            Booking Summary
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Parlor:</strong> {parlor?.name || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Service:</strong> {service || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Date:</strong> {date || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Time:</strong> {time || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Employee:</strong> {favoriteEmployee || "N/A"}
          </Typography>
          <Typography sx={{ fontWeight: "bold", color: "#4a3f8c" }}>
            Total Amount: ₹{totalAmount || "0"}
          </Typography>
        </Box>

        {/* Select Payment Amount Section */}
        <Box
          sx={{
            flex: 1,
            minWidth: "48%",
            p: 4,
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
            color: "#333333",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
            border: "1px solid #4a3f8c",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#4a3f8c",
              mb: 2,
              textDecoration: "underline",
            }}
          >
            Select Payment Amount
          </Typography>
          <RadioGroup
            value={paymentAmountOption}
            onChange={handlePaymentAmountChange}
          >
            <FormControlLabel
              style={{ color: "#333333" }}
              value="25%"
              control={<Radio />}
              label={`25% of Total Amount (₹${(totalAmount * 0.25).toFixed(2)})`}
            />
            <FormControlLabel
              style={{ color: "#333333" }}
              value="full"
              control={<Radio />}
              label={`Full Amount (₹${totalAmount})`}
            />
          </RadioGroup>

          {error && <Alert severity="error">{error}</Alert>}
          {showSuccess && (
            <Alert severity="success">Payment option selected successfully!</Alert>
          )}

          <motion.button
            onClick={handleConfirm}
            style={{
              background: "rgba(74, 63, 140, 0.1)",
              color: "#4a3f8c",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(74, 63, 140, 0.3)",
              fontSize: "1rem",
              fontWeight: 500,
              width: "fit-content",
              marginTop: "20px",
              cursor: "pointer",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
            whileHover={{
              background: "rgba(74, 63, 140, 0.2)",
              borderColor: "#4a3f8c",
            }}
            transition={{ duration: 0.3 }}
          >
            Confirm Payment
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4a3f8c"
              style={{ marginLeft: "8px" }}
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                strokeWidth="2"
              />
            </svg>
          </motion.button>
        </Box>
      </Box>
      <style>
        {`
        h2.text-primary {
            font-family: 'Montserrat', sans-serif ; // New font
            font-weight: 600;
            font-size: 2rem;
            color: #0e0f0f; // New vibrant blue
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); // Subtle depth
            position: relative;
            margin-bottom: 1.5rem;
          }

          h2.text-primary::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 2px;
            background: #0e0f0f; // Match new color
            border-radius: 1px;
          }`}
      </style>
    </Box>
  );
};

export default Pay;