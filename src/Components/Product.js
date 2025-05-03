import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Modal,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FilterListIcon from "@mui/icons-material/FilterList";

const BASE_URL = process.env.REACT_APP_API_URL;

// Styled components (unchanged)
const StyledCard = styled(Card)(({ theme }) => ({
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
  transition: "transform 0.3s, box-shadow 0.3s",
  width: "100%",
  maxWidth: { xs: "300px", sm: "340px", md: "360px" },
  height: "auto",
  background: "#ffffff",
  color: "#0e0f0f",
  borderRadius: "12px",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    maxWidth: "280px",
  },
  [theme.breakpoints.down(360)]: {
    maxWidth: "260px",
  },
}));

const BookButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#201548",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#1a1138",
  },
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
  padding: { xs: "6px 12px", sm: "8px 16px" },
  borderRadius: "8px",
}));

const DirectionButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#201548",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#1a1138",
  },
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
  padding: { xs: "6px 12px", sm: "8px 16px" },
  borderRadius: "8px",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 400,
  backgroundColor: "#ffffff",
  color: "#0e0f0f",
  boxShadow: theme.shadows[24],
  padding: { xs: 2, sm: 4 },
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  [theme.breakpoints.down("sm")]: {
    width: "95%",
    maxWidth: 320,
  },
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  background: "#ffffff",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  padding: theme.spacing(2),
  marginBottom: theme.spacing(4),
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  justifyContent: "center",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 150,
  backgroundColor: "#ffffff",
  borderRadius: theme.shape.borderRadius,
  "& .MuiInputBase-root": {
    backgroundColor: "#ffffff",
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.875rem", sm: "1rem" },
    color: "#201548",
  },
  "& .MuiSelect-icon": {
    color: "#201548",
  },
  "&:hover": {
    "& .MuiInputBase-root": {
      backgroundColor: "#f5f5f5",
    },
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: 120,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  minWidth: { xs: 200, sm: 300 },
  backgroundColor: "#ffffff",
  borderRadius: theme.shape.borderRadius,
  "& .MuiInputBase-input": {
    fontSize: { xs: "0.875rem", sm: "1rem" },
    color: "#0e0f0f",
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.875rem", sm: "1rem" },
    color: "#201548",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#201548",
    },
    "&:hover fieldset": {
      borderColor: "#1a1138",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#201548",
    },
  },
}));

const StyledResetButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#201548",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#1a1138",
  },
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
  padding: theme.spacing(1, 2),
  borderRadius: "8px",
}));

const FilterToggleButton = styled(IconButton)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("sm")]: {
    display: "block",
    color: "#201548",
    backgroundColor: "#ffffff",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
}));

// Haversine formula and parseParlorLocation (unchanged)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (
    !lat1 ||
    !lon1 ||
    !lat2 ||
    !lon2 ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    // console.warn("Invalid coordinates:", { lat1, lon1, lat2, lon2 });
    return null;
  }
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
};

const parseParlorLocation = (location) => {
  if (!location || typeof location !== "string") {
    // console.warn(`Invalid or missing location: ${location}`);
    return null;
  }
  const match = location.match(/Lat:\s*([\d.-]+),\s*Lon:\s*([\d.-]+)/i);
  if (!match) {
    // console.warn(`Invalid location format: ${location}`);
    return null;
  }
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lon)) {
    // console.warn(`Invalid coordinates: Lat=${match[1]}, Lon=${match[2]}`);
    return null;
  }
  return { lat, lon };
};

// ParlorCard component (unchanged)
const ParlorCard = ({ parlor, onImageClick, userLocation }) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const getGoogleMapsUrl = (location) => {
    const coords = parseParlorLocation(location);
    if (!coords) return "#";
    return `https://www.google.com/maps?q=${coords.lat},${coords.lon}`;
  };

  const getDistanceDisplay = () => {
    if (!userLocation) {
      return "Please set your location";
    }
    if (!parlor.location) {
      // console.log("Missing parlor location:", parlor);
      return "Unknown";
    }
    const parlorCoords = parseParlorLocation(parlor.location);
    if (!parlorCoords) return "Invalid parlor location";
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      parlorCoords.lat,
      parlorCoords.lon
    );
    if (distance === null) {
      // console.warn(`Distance calculation failed for parlor: ${parlor.name}`);
      return "Unknown";
    }
    return `${distance} km`;
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setCredentials({ identifier: "", password: "" });
    setError("");
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { identifier, password } = credentials;

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/login`,
        {
          identifier,
          password,
          role: "User",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;

      if (response.status === 200) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", identifier);
        localStorage.setItem("userRole", "User");
        handleCloseModal();
        navigate("/bookslot", { state: { parlor } });
        window.location.reload(); // Reload the page
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      // console.error("Login error:", err);
      setError(err.response?.data?.message || "Server error");
    }
  };

  const handleBooking = async () => {
    try {
      const email1 = localStorage.getItem("email");

      if (!email1) {
        alert("Login data not found. Please login first.");
        handleOpenModal();
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/users/check/login/${email1}`
      );

      if (response.status === 200 && response.data.loginData) {
        navigate("/bookslot", { state: { parlor } });
      } else {
        alert("Login data not found. Please login first.");
        handleOpenModal();
      }
    } catch (error) {
      // console.error("Login check failed:", error);
      alert(`Something went wrong: ${error.message || error}`);
      handleOpenModal();
    }
  };

  return (
    <>
      <StyledCard sx={{ m: { xs: 1, sm: 2 } }}>
        <CardMedia
          component="img"
          height="180"
          image={parlor.image}
          alt={parlor.name}
          onClick={() => onImageClick(parlor)}
          sx={{ cursor: "pointer", objectFit: "cover" }}
        />
        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.1rem" },
              fontWeight: "bold",
              color: "#0e0f0f",
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            {parlor.name}
          </Typography>
          {/* // Typography (Designation and Service) */}
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: "#0e0f0f",
              mb: 0.5,
            }}
          >
            {parlor.designation} | {parlor.service}
          </Typography>
          {/* // Typography (Price and Style) */}
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: "#201548",
              fontWeight: "bold",
            }}
          >
            ₹{parlor.price} | {parlor.style}
          </Typography>
          {/* // Rating Box */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                color: "#0e0f0f",
              }}
            >
              {parlor.spRating}
            </Typography>
            <i
              className="fa fa-star"
              style={{ marginLeft: "4px", color: "#fbc02d" }}
            ></i>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                ml: 1,
                color: "#0e0f0f",
              }}
            >
              ({parlor.countPeople} Ratings)
            </Typography>
          </Box>
          {/* // Distance Typography */}
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              color: "#0e0f0f",
            }}
          >
            Distance: {getDistanceDisplay()}
          </Typography>
          <Box
            sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "center" }}
          >
            <BookButton
              size="small"
              onClick={handleBooking}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 1.5, sm: 2 },
              }}
            >
              Book
            </BookButton>
            <DirectionButton
              size="small"
              onClick={() =>
                window.open(getGoogleMapsUrl(parlor.location), "_blank")
              }
              startIcon={<i className="fa fa-location-dot"></i>}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 1.5, sm: 2 },
              }}
            >
              Direction
            </DirectionButton>
          </Box>
        </CardContent>
      </StyledCard>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="login-modal-title"
        sx={{
          backdropFilter: "blur(5px)",
        }}
      >
        <ModalContent
          sx={{
            backgroundColor: "rgb(255, 245, 255)",
            padding: { xs: "16px", sm: "20px" },
          }}
        >
          <Typography
            id="login-modal-title"
            variant="h5"
            component="h2"
            textAlign="center"
            sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" }, color: "#0e0f0f" }}
          >
            User Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Email or Phone"
              variant="outlined"
              name="identifier"
              value={credentials.identifier}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            />
            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {error}
              </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "#201548",
                  fontSize: { xs: "12px", sm: "14px" },
                }}
              >
                Forgot Password?
              </Link>
            </Box>
            <Box
              sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "center" }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#201548",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#1a1138" },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                  borderColor: "#201548",
                  color: "#201548",
                  "&:hover": { borderColor: "#1a1138", color: "#1a1138" },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Cancel
              </Button>
            </Box>

            {/* // Sign Up Link */}
            <Typography
              textAlign="center"
              sx={{
                fontSize: { xs: "12px", sm: "14px" },
                mt: 2,
                color: "#0e0f0f",
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{ textDecoration: "none", color: "#201548" }}
              >
                Sign up
              </Link>
            </Typography>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

const useGoogleMapsAutocomplete = (
  inputRef,
  setLocationInput,
  setUserLocation
) => {
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.places &&
        inputRef.current
      ) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            fields: ["formatted_address", "geometry", "name"],
            types: [],
          }
        );

        const listener = autocompleteRef.current.addListener(
          "place_changed",
          () => {
            const place = autocompleteRef.current.getPlace();
            if (!place.geometry || !place.geometry.location) {
              alert(`No details available for input: '${place.name}'`);
              setLocationInput("");
              setUserLocation(null);
              return;
            }
            setLocationInput(place.formatted_address);
            setUserLocation({
              lat: place.geometry.location.lat(),
              lon: place.geometry.location.lng(),
            });
          }
        );

        return () => {
          if (window.google && window.google.maps) {
            window.google.maps.event.removeListener(listener);
          }
        };
      } else {
        return setTimeout(initializeAutocomplete, 100);
      }
    };

    const timeoutId = initializeAutocomplete();

    return () => {
      clearTimeout(timeoutId);
      if (autocompleteRef.current && window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [inputRef, setLocationInput, setUserLocation]);
};

const Product = () => {
  const [selectedParlor, setSelectedParlor] = useState(null);
  const [detailedParlor, setDetailedParlor] = useState(null);
  const [beautyParlors, setBeautyParlors] = useState([]);
  const [filteredParlors, setFilteredParlors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const autocompleteInputRef = useRef(null);

  useGoogleMapsAutocomplete(
    autocompleteInputRef,
    setLocationInput,
    setUserLocation
  );

  const roleOptions = {
    Salon: ["HairCut", "Facial", "HairColor", "Shaving"],
    Beauty_Parler: ["HairCut", "Bridal", "Waxing", "Pedicure"],
    Doctor: ["Hair Treatment", "Skin Treatment"],
  };

  const allServices = Array.from(
    new Set([
      ...roleOptions.Salon,
      ...roleOptions.Beauty_Parler,
      ...roleOptions.Doctor,
    ])
  );

  const ratingOptions = [
    { value: "all", label: "All Ratings", range: [0, 5] },
    { value: "1-1.9", label: "1+", stars: "★", range: [1, 1.9] },
    { value: "2-2.9", label: "2+", stars: "★★", range: [2, 2.9] },
    { value: "3-3.9", label: "3+", stars: "★★★", range: [3, 3.9] },
    { value: "4-4.9", label: "4+", stars: "★★★★", range: [4, 4.9] },
    { value: "5", label: "5", stars: "★★★★★", range: [5, 5] },
  ];

  const getActiveDesignation = () => {
    if (location.state?.designation) {
      return location.state.designation;
    }
    const path = location.pathname.toLowerCase();
    if (path.includes("salon")) return "Salon";
    if (path.includes("beauty")) return "Beauty_Parler";
    if (path.includes("skincare")) return "Doctor";
    return "";
  };

  const getGoogleMapsUrlFromCoords = (lat, lon) => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      return "#";
    }
    return `https://www.google.com/maps?q=${lat},${lon}`;
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/users/cards/services`)
      .then((response) => {
        const parsed = response.data.map((item, index) => ({
          id: index + 1,
          name: item.shopName || "No Name",
          image: item.shopImage
            ? `${BASE_URL}/${item.shopImage}`
            : "placeholder.jpg",
          location: item.location || null,
          service: item.serviceName || "Service",
          style: item.style || "No Style",
          email: item.email || "No Email",
          price: item.price || 0,
          designation: item.designation || "Salon",
          countPeople: item.countPeople || 0,
          spRating: parseFloat(item.spRating) || 0,
        }));
        setBeautyParlors(parsed);
        setFilteredParlors(parsed);
        setLoading(false);
      })
      .catch((error) => {
        // console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const newDesignation = getActiveDesignation();
    const newService = location.state?.service || "";
    setDesignationFilter(newDesignation);
    setServiceFilter(newService);
  }, [location.pathname, location.state]);

  useEffect(() => {
    let filtered = beautyParlors;

    if (designationFilter && designationFilter !== "All Products") {
      filtered = filtered.filter(
        (parlor) => parlor.designation === designationFilter
      );
    }

    if (ratingFilter !== "all") {
      const selectedRange = ratingOptions.find(
        (option) => option.value === ratingFilter
      )?.range;
      if (selectedRange) {
        filtered = filtered.filter(
          (parlor) =>
            parlor.spRating >= selectedRange[0] &&
            parlor.spRating <= selectedRange[1]
        );
      }
    }

    if (distanceFilter !== "all" && userLocation) {
      filtered = filtered.filter((parlor) => {
        const parlorCoords = parseParlorLocation(parlor.location);
        if (!parlorCoords) {
          return false;
        }
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          parlorCoords.lat,
          parlorCoords.lon
        );
        if (dist === null) return false;
        if (distanceFilter === "0-1") return dist <= 1;
        if (distanceFilter === "0-3") return dist > 0 && dist <= 3;
        if (distanceFilter === "0-5") return dist > 0 && dist <= 5;
        if (distanceFilter === "more") return dist > 0;
        return true;
      });
    }

    if (serviceFilter) {
      filtered = filtered.filter((parlor) => parlor.service === serviceFilter);
    }

    setFilteredParlors(filtered);
  }, [
    beautyParlors,
    designationFilter,
    ratingFilter,
    distanceFilter,
    serviceFilter,
    userLocation,
  ]);

  const handleRatingChange = (event) => {
    setRatingFilter(event.target.value);
  };

  const handleDistanceChange = (event) => {
    setDistanceFilter(event.target.value);
  };

  const handleServiceChange = (event) => {
    setServiceFilter(event.target.value);
  };

  const handleDesignationChange = (event) => {
    setDesignationFilter(event.target.value);
    setServiceFilter("");
  };

  const handleResetFilters = () => {
    setRatingFilter("all");
    setDistanceFilter("all");
    setServiceFilter("");
    setDesignationFilter("");
    setLocationInput("");
    setUserLocation(null);
    setShowFilters(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        py: { xs: 3, sm: 4, md: 6 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          maxWidth: {
            xs: "100%",
            sm: "90%",
            md: "1200px",
            lg: "1600px",
            xl: "2000px",
          },
        }}
      >
        <style>
          {`
          h2.text-primary {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 2.5rem;
            background: linear-gradient(90deg,rgb(7, 24, 24),rgb(0, 0, 0));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          h2.text-primary::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: #000;
            borderRadius: 2px;
          }`}
        </style>
        <h2
          className="text-primary fw-bold mb-4 animate__animated animate__fadeInDown"
          style={{
            animationDuration: "1s",
            fontSize: "1.8rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#1abc9c",
          }}
        >
          Our Services
        </h2>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <FilterToggleButton onClick={handleToggleFilters}>
            <FilterListIcon />
          </FilterToggleButton>
        </Box>
        {(showFilters || window.innerWidth >= 600) && (
          <FilterContainer>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <StyledTextField
                label="Your Location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                inputRef={autocompleteInputRef}
                placeholder="Search for any place (e.g., college, shop, park)"
              />
              <IconButton
                onClick={() =>
                  window.open(
                    getGoogleMapsUrlFromCoords(
                      userLocation?.lat,
                      userLocation?.lon
                    ),
                    "_blank"
                  )
                }
                disabled={!userLocation}
                color="primary"
                sx={{ p: { xs: 0.5, sm: 1.5 } }}
              >
                <i className="fa fa-map"></i>
              </IconButton>
            </Box>
            <StyledFormControl>
              <InputLabel>Designation</InputLabel>
              <Select
                value={designationFilter}
                onChange={handleDesignationChange}
                label="Designation"
              >
                <MenuItem value="All Products">All Products</MenuItem>
                <MenuItem value="Salon">Salon</MenuItem>
                <MenuItem value="Beauty_Parler">Beauty Parlor</MenuItem>
                <MenuItem value="Doctor">Doctor</MenuItem>
              </Select>
            </StyledFormControl>
            <StyledFormControl>
              <InputLabel>Rating</InputLabel>
              <Select
                value={ratingFilter}
                onChange={handleRatingChange}
                label="Rating"
              >
                {ratingOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ color: "#fbc02d", mr: 1 }}>
                        {option.stars}
                      </Typography>
                      <Typography>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
            <StyledFormControl>
              <InputLabel>Distance</InputLabel>
              <Select
                value={distanceFilter}
                onChange={handleDistanceChange}
                label="Distance"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="0-1">0-1 km</MenuItem>
                <MenuItem value="0-3">0-3 km</MenuItem>
                <MenuItem value="0-5">0-5 km</MenuItem>
                <MenuItem value="more">More than 5 km</MenuItem>
              </Select>
            </StyledFormControl>
            <StyledFormControl>
              <InputLabel>Service</InputLabel>
              <Select
                value={serviceFilter}
                onChange={handleServiceChange}
                label="Service"
              >
                <MenuItem value="">All Services</MenuItem>
                {(designationFilter === "All Products"
                  ? allServices
                  : roleOptions[designationFilter] || []
                ).map((service) => (
                  <MenuItem key={service} value={service}>
                    {service}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
            <StyledResetButton variant="contained" onClick={handleResetFilters}>
              Reset
            </StyledResetButton>
          </FilterContainer>
        )}
        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 3 }}
          justifyContent="center"
          sx={{
            // "--Grid-borderWidth": "1px",
            borderTop: "var(--Grid-borderWidth) solid",
            borderLeft: "var(--Grid-borderWidth) solid",
            borderColor: "divider",
            "& > div": {
              borderRight: "var(--Grid-borderWidth) solid",
              borderBottom: "var(--Grid-borderWidth) solid",
              borderColor: "divider",
            },
          }}
        >
          {loading ? (
            <Typography
              variant="h6"
              align="center"
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                gridColumn: "1 / -1", // Makes it span all columns
              }}
            >
              Loading...
            </Typography>
          ) : filteredParlors.length === 0 ? (
            <Typography
              variant="h6"
              align="center"
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                gridColumn: "1 / -1", // Makes it span all columns
              }}
            >
              Services Not Found
            </Typography>
          ) : (
            filteredParlors.map((parlor) => (
              <Grid
                key={parlor.id}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  // Responsive column spans
                  "@media (min-width:0px)": {
                    gridColumn: "span 12",
                  },
                  "@media (min-width:600px)": {
                    gridColumn: "span 6",
                  },
                  "@media (min-width:900px)": {
                    gridColumn: "span 4",
                  },
                  "@media (min-width:1200px)": {
                    gridColumn: "span 3",
                  },
                  "@media (min-width:1536px)": {
                    gridColumn: "span 2",
                  },
                }}
              >
                <ParlorCard
                  parlor={parlor}
                  onImageClick={setDetailedParlor}
                  userLocation={userLocation}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Product;
