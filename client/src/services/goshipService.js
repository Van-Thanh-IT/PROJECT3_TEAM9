import axiosClient from "./axiosClient"; 
const goshipService = {
  // Lấy danh sách Thành phố
  getCities: () => {
    return axiosClient.get("/goship/cities");
  },

  // Lấy Quận/Huyện theo city_code
  getDistricts: (cityCode) => {
    return axiosClient.get(`/goship/cities/${cityCode}/districts`);
  },

  // Lấy Phường/Xã theo district_code
  getWards: (districtCode) => {
    return axiosClient.get(`/goship/districts/${districtCode}/wards`);
  },

  // Tính phí ship
  calculateFee: (data) => {
    // data bao gồm: city, district, ward, cod, amount, weight, width, height, length
    return axiosClient.post("/goship/shipping-fee", data);
  },
};

export default goshipService;