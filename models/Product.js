import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  supplier: String,
  stage: { type: Number, default: 0 },
  completedBy: {
    type: Object,
    default: { Ordered: "", RMS: "", Manufacturing: "", Distribution: "", Retail: "", Sold: "" }
  },
  timestamp: { type: Date, default: Date.now }
});
const Product = mongoose.model("Product", ProductSchema);
export default Product;
