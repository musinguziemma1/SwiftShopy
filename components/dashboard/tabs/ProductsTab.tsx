import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Eye, Edit, Trash2, AlertCircle } from "lucide-react";
import { containerVariants, itemVariants, fadeInVariants, fmt } from "../utils";
import { Product } from "../utils";

interface ProductsTabProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'sales' | 'image'>) => void;
  onUpdateProduct: (id: string, data: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onToggleProduct: (id: string, isActive: boolean) => void;
}

const ProductsTab = memo<ProductsTabProps>(({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onToggleProduct }) => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productsPage, setProductsPage] = useState(1);
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, stock: 0, category: "", description: "" });
  const itemsPerPage = 12;

  const lowStockCount = useMemo(() => products.filter(p => p.stock > 0 && p.stock <= 5).length, [products]);
  const outOfStockCount = useMemo(() => products.filter(p => p.stock === 0).length, [products]);
  const wellStockedCount = useMemo(() => products.filter(p => p.stock > 5).length, [products]);
  const paginatedProducts = useMemo(() => {
    const start = (productsPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, productsPage, itemsPerPage]);

  const handleCreateProduct = useCallback(() => {
    if (!newProduct.name || !newProduct.category) return;
    onAddProduct(newProduct);
    setShowAddProduct(false);
    setNewProduct({ name: "", price: 0, stock: 0, category: "", description: "" });
  }, [newProduct, onAddProduct, setShowAddProduct, setNewProduct]);

  const handleEditProduct = useCallback((id: string, data: Partial<Product>) => {
    onUpdateProduct(id, data);
    setEditingProduct(null);
  }, [onUpdateProduct, setEditingProduct]);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={fadeInVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Products</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your product catalog</p>
        </div>
        <button onClick={() => setShowAddProduct(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-medium hover:scale-105 transition-all shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </motion.div>

      <AnimatePresence>
        {showAddProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-lg glass rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Product</h3>
                <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-accent/50 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Enter product name" className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (UGX)</label>
                    <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) })}
                      placeholder="0" className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock</label>
                    <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                      placeholder="0" className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Select category</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Food">Food</option>
                    <option value="Home">Home</option>
                    <option value="Beauty">Beauty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea rows={3} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Product description" className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <button onClick={handleCreateProduct}
                  className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                  Create Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Low Stock", count: lowStockCount, desc: "Products below 5 units", color: "border-amber-500/30 bg-amber-500/10", icon: "text-amber-500" },
          { label: "Out of Stock", count: outOfStockCount, desc: "Products unavailable", color: "border-red-500/30 bg-red-500/10", icon: "text-red-500" },
          { label: "Well Stocked", count: wellStockedCount, desc: "Products in good stock", color: "border-green-500/30 bg-green-500/10", icon: "text-green-500" },
        ].map((a, i) => (
          <motion.div key={i} variants={itemVariants} className={`p-3 sm:p-4 rounded-xl border-2 ${a.color} cursor-pointer`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${a.icon}`} />
              <span className="font-semibold text-sm sm:text-base">{a.label}</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{a.count}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">{a.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {paginatedProducts.map((product, i) => (
          <motion.div key={product.id} variants={itemVariants} className="p-3 sm:p-4 glass rounded-xl group">
            <div className="mb-3 sm:mb-4">
              <img src={product.image} alt={product.name} loading="lazy" className="w-full h-32 sm:h-48 object-cover rounded-lg" />
            </div>
            {editingProduct === product.id ? (
              <input type="text" defaultValue={product.name} autoFocus
                onBlur={(e) => handleEditProduct(product.id, { name: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                className="w-full mb-1 px-2 py-1 bg-accent/50 rounded text-sm font-semibold" />
            ) : (
              <h3 className="font-semibold mb-1 truncate text-sm sm:text-base" onClick={() => setEditingProduct(product.id)}>
                {product.name}
              </h3>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{product.category}</p>
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-base sm:text-lg font-bold">{fmt(product.price)}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Stock: {product.stock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sales: {product.sales}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onToggleProduct(product.id, true)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"><Eye className="w-4 h-4" /></button>
                <button onClick={() => setEditingProduct(product.id)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => onDeleteProduct(product.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {products.length > itemsPerPage && (
        <motion.div variants={fadeInVariants} className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Showing {((productsPage - 1) * itemsPerPage) + 1}-{Math.min(productsPage * itemsPerPage, products.length)} of {products.length}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setProductsPage(p => Math.max(1, p - 1))} disabled={productsPage === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
              Prev
            </button>
            {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, i) => (
              <button key={i + 1} onClick={() => setProductsPage(i + 1)}
                className={`px-3 py-1.5 text-sm rounded-lg border ${productsPage === i + 1 ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setProductsPage(p => Math.min(Math.ceil(products.length / itemsPerPage), p + 1))}
              disabled={productsPage === Math.ceil(products.length / itemsPerPage)}
              className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

export default ProductsTab;