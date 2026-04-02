const fs = require('fs');
const path = "d:/Web Projects/Projects/Swift2/SwiftShopy/app/(admin)/admin/page.tsx";
let code = fs.readFileSync(path, "utf-8");

// State injection
if (!code.includes("sellerPage")) {
    const state_injection = `
  // Pagination State
  const ITEMS_PER_PAGE = 30;
  const [sellerPage, setSellerPage] = useState(1);
  const [txnPage, setTxnPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);

  const renderPagination = (currentPage: number, totalItems: number, setPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 glass rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 transition-all">Previous</button>
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold">{currentPage}</div>
          <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 glass rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 transition-all">Next</button>
        </div>
      </div>
    );
  };
`;
    code = code.replace("  const [sidebarOpen, setSidebarOpen] = useState(true)", state_injection + "\n  const [sidebarOpen, setSidebarOpen] = useState(true)");
}

// 1. Sellers
const sellerFilter = `{sellers.filter(seller => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return seller.name.toLowerCase().includes(q) || 
                          seller.email.toLowerCase().includes(q) || 
                          (seller.storeName && seller.storeName.toLowerCase().includes(q));
                      })}`;
const sellerTarget = sellerFilter + `.map((seller, i) => (`;
if (code.includes(sellerTarget)) {
    code = code.replace(sellerTarget, sellerFilter + `.slice((sellerPage - 1) * ITEMS_PER_PAGE, sellerPage * ITEMS_PER_PAGE).map((seller, i) => (`);
    // Find the next </table></div> to append pagination
    const afterTable = code.substring(code.indexOf(sellerFilter)).indexOf("</table>\n                  </div>");
    if (afterTable !== -1) {
        const fullIdx = code.indexOf(sellerFilter) + afterTable + "</table>\n                  </div>".length;
       const inject = `\n                  {(() => {
                    const filtered = ${sellerFilter.slice(1, -1)};
                    return renderPagination(sellerPage, filtered.length, setSellerPage);
                  })()}`;
       code = code.substring(0, fullIdx) + inject + code.substring(fullIdx);
    }
}

// 2. Transactions
const txnFilter = `{transactions.filter(txn => {
                        if (txnSearch && !txn.seller.toLowerCase().includes(txnSearch.toLowerCase()) && !txn.id.toLowerCase().includes(txnSearch.toLowerCase())) return false;
                        if (txnStatusFilter !== "all" && txn.status !== txnStatusFilter) return false;
                        if (txnTypeFilter !== "all" && txn.type !== txnTypeFilter) return false;
                        return true;
                      })}`;
const txnTarget = txnFilter + `.map((txn, i) => (`;
if (code.includes(txnTarget)) {
    code = code.replace(txnTarget, txnFilter + `.slice((txnPage - 1) * ITEMS_PER_PAGE, txnPage * ITEMS_PER_PAGE).map((txn, i) => (`);
    const tblIdx = code.indexOf(txnFilter);
    const afterTable = code.substring(tblIdx).indexOf("</table>\n                  </div>");
    if (afterTable !== -1) {
        const fullIdx = tblIdx + afterTable + "</table>\n                  </div>".length;
        const inject = `\n                  {(() => {
                    const filtered = ${txnFilter.slice(1, -1)};
                    return renderPagination(txnPage, filtered.length, setTxnPage);
                  })()}`;
        code = code.substring(0, fullIdx) + inject + code.substring(fullIdx);
    }
}

// 3. Disbursements
const payFilter = `{disbursements.filter(d => {
                        if (payoutPlan !== "all" && d.status !== payoutPlan) return false;
                        if (txnSearch && !d.seller.toLowerCase().includes(txnSearch.toLowerCase()) && !d.storeName.toLowerCase().includes(txnSearch.toLowerCase())) return false;
                        return true;
                      })}`;
const payTarget = payFilter + `.map((d, i) => (`;
if (code.includes(payTarget)) {
    code = code.replace(payTarget, payFilter + `.slice((payoutPage - 1) * ITEMS_PER_PAGE, payoutPage * ITEMS_PER_PAGE).map((d, i) => (`);
    const tblIdx = code.indexOf(payFilter);
    const afterTable = code.substring(tblIdx).indexOf("</table>\n                  </div>");
    if (afterTable !== -1) {
        const fullIdx = tblIdx + afterTable + "</table>\n                  </div>".length;
        const inject = `\n                  {(() => {
                    const filtered = ${payFilter.slice(1, -1)};
                    return renderPagination(payoutPage, filtered.length, setPayoutPage);
                  })()}`;
        code = code.substring(0, fullIdx) + inject + code.substring(fullIdx);
    }
}

// 4. Admins
const adminFilter = `{allAdmins.filter(admin => {
                        if (auditFilter !== "all" && admin.role !== auditFilter) return false;
                        if (searchQuery && !admin.name.toLowerCase().includes(searchQuery.toLowerCase()) && !admin.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                        return true;
                      })}`;
const adminTarget = adminFilter + `.map((admin, i) => (`;
if (code.includes(adminTarget)) {
    code = code.replace(adminTarget, adminFilter + `.slice((adminPage - 1) * ITEMS_PER_PAGE, adminPage * ITEMS_PER_PAGE).map((admin, i) => (`);
    const tblIdx = code.indexOf(adminFilter);
    const afterTable = code.substring(tblIdx).indexOf("</table>\n                  </div>");
    if (afterTable !== -1) {
        const fullIdx = tblIdx + afterTable + "</table>\n                  </div>".length;
        const inject = `\n                  {(() => {
                    const filtered = ${adminFilter.slice(1, -1)};
                    return renderPagination(adminPage, filtered.length, setAdminPage);
                  })()}`;
        code = code.substring(0, fullIdx) + inject + code.substring(fullIdx);
    }
}

fs.writeFileSync(path, code, "utf-8");
console.log("PATCH V2 COMPLETE");
