const fs = require('fs');

const path = "d:/Web Projects/Projects/Swift2/SwiftShopy/app/(admin)/admin/page.tsx";
let code = fs.readFileSync(path, "utf-8");

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

if (!code.includes("sellerPage")) {
    code = code.replace("  const [sidebarOpen, setSidebarOpen] = useState(true)", state_injection + "\n  const [sidebarOpen, setSidebarOpen] = useState(true)");
}

function patchTable(code, varArrayBase, varPageName) {
    const regex = new RegExp("(\\{" + varArrayBase + "\\.filter\\([\\s\\S]*?\\)\\})\\.map\\(\\([a-zA-Z0-9_]+,\\s*[a-zA-Z0-9_]+\\)\\s*=>\\s*\\(");
    const match = code.match(regex);
    if (!match) {
        console.log("No match for", varArrayBase);
        return code;
    }
    
    const filterExpr = match[1];
    
    // Inject slice
    const sliceInjection = ".slice((" + varPageName + " - 1) * ITEMS_PER_PAGE, " + varPageName + " * ITEMS_PER_PAGE)";
    
    // replace filter().map with filter().slice().map
    const idx = code.indexOf(filterExpr) + filterExpr.length;
    code = code.substring(0, idx) + sliceInjection + code.substring(idx);
    
    // Find closing structure
    const matchEndIdx = idx + sliceInjection.length;
    const tableCloseIdx = code.indexOf("</table>", matchEndIdx);
    if (tableCloseIdx !== -1) {
        const divCloseIdx = code.indexOf("</div>", tableCloseIdx);
        if (divCloseIdx !== -1) {
            const setPageFnName = "set" + varPageName.charAt(0).toUpperCase() + varPageName.slice(1);
            const injection = `\n                  {(() => {
                    const filtered = ${filterExpr.slice(1, -1)};
                    return renderPagination(${varPageName}, filtered.length, ${setPageFnName});
                  })()}`;
            code = code.substring(0, divCloseIdx + 6) + injection + code.substring(divCloseIdx + 6);
        }
    }
    
    return code;
}

code = patchTable(code, "sellers", "sellerPage");
code = patchTable(code, "transactions", "txnPage");
code = patchTable(code, "disbursements", "payoutPage");
code = patchTable(code, "allAdmins", "adminPage");

fs.writeFileSync(path, code, "utf-8");
console.log("PATCH SUCCESSFUL");
