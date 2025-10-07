import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/address`,
        { withCredentials: true }
      );
      if (data.addresses && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching addresses", error);
    }
  };

  const handleDeleteClick = (address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/address/${addressToDelete._id}`,
        { withCredentials: true }
      );
      setAddresses(
        addresses.filter((addr) => addr._id !== addressToDelete._id)
      );
      setShowDeleteModal(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const addNewAddress = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/address`,
        newAddress,
        { withCredentials: true }
      );
      await fetchAddresses();
      setShowAddModal(false);
      setNewAddress({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      });
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const placeOrder = async () => {
    try {
      navigate("/orderSummary", { state: { selectedAddress } });
      console.log(selectedAddress);
    } catch (error) {
      console.log("Error placing Order", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout-container">
        <h2>Checkout</h2>

        <h3>Saved Addresses</h3>
        {addresses.length > 0 ? (
          <div className="address-list">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`address-card ${
                  selectedAddress === address ? "selected" : ""
                }`}
                onClick={() => setSelectedAddress(address)}
              >
                <div className="address-details">
                  <p>{address.fullName}</p>
                  <p>
                    {address.street}, {address.city}, {address.state} -{" "}
                    {address.zip}
                  </p>
                  <p>{address.country}</p>
                  <p>Phone: {address.phone}</p>
                </div>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(address);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No saved addresses</p>
        )}

        {/* Button to Open Add Address Modal */}
        <button
          className="add-address-button"
          onClick={() => setShowAddModal(true)}
        >
          Add New Address
        </button>

        <button className="place-order-button" onClick={placeOrder}>
          Place Order
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="address-form-modal show">
          <div className="address-form-modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this address?</p>
            <div className="address-form-modal-buttons">
              <button className="confirm-delete" onClick={confirmDelete}>
                Delete
              </button>
              <button
                className="cancel-delete"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="address-form-modal show">
          <div className="address-form-modal-content">
            <h3>Add New Address</h3>
            <div className="new-address-form">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={newAddress.fullName}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={newAddress.phone}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="street"
                placeholder="Street"
                value={newAddress.street}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={newAddress.city}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={newAddress.state}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                value={newAddress.zip}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={newAddress.country}
                onChange={handleNewAddressChange}
              />
            </div>
            <div className="address-form-modal-buttons">
              <button className="confirm-add" onClick={addNewAddress}>
                Add Address
              </button>
              <button
                className="cancel-add"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;
