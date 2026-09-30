import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BadgePercent,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import loanService from "../../services/loanService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { maskAccountNumber } from "../../utils/maskers";
import { LoanCard } from "../../components/loans";
import { SectionHeading, Badge, Button, Modal, LoadingState } from "../../components/common";

const LoansPage = () => {
  const { customer } = useAuth();
  const [loans, setLoans] = useState([]);
  const [installmentsMap, setInstallmentsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // EMI Payment Simulation Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);
        const loansData = await loanService.getLoansByCustomer(customer?.custId || "CUST001");
        setLoans(loansData);

        // Fetch installments for each loan
        const map = {};
        for (const loan of loansData) {
          const insts = await loanService.getInstallmentsByLoan(loan.loanId);
          map[loan.loanId] = insts;
        }
        setInstallmentsMap(map);
      } catch (err) {
        console.error("Failed to load loan details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, [customer]);

  // Aggregate metrics
  const totalSanctioned = loans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const activeLoans = loans.filter((l) => l.status === "Active");

  // Open EMI Pay Modal
  const handleOpenPayEmi = (loan, installment) => {
    setSelectedLoan(loan);
    setSelectedInstallment(installment);
    setPaymentSuccess(false);
    setPaymentModalOpen(true);
  };

  // Simulate paying an EMI in local state
  const handleConfirmEmiPayment = () => {
    if (!selectedLoan || !selectedInstallment) return;

    setProcessing(true);
    setTimeout(() => {
      // Update installment state locally
      setInstallmentsMap((prevMap) => {
        const currentLoanInsts = prevMap[selectedLoan.loanId] || [];
        const updated = currentLoanInsts.map((inst) =>
          inst.installmentId === selectedInstallment.installmentId
            ? { ...inst, status: "Paid", paidOn: new Date().toISOString().split("T")[0] }
            : inst
        );
        return { ...prevMap, [selectedLoan.loanId]: updated };
      });

      setProcessing(false);
      setPaymentSuccess(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setPaymentModalOpen(false);
    setSelectedLoan(null);
    setSelectedInstallment(null);
    setPaymentSuccess(false);
  };

  if (loading) {
    return <LoadingState message="Loading your loans and EMI schedules..." fullPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <SectionHeading
        title="Loans & Borrowings"
        subtitle="Review active credit facilities, track tenure progress, and manage scheduled EMI installments."
        badge={
          <Badge variant="info" size="sm">
            {loans.length} Borrowing Facilities
          </Badge>
        }
      />

      {/* Aggregate Borrowing Highlights */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Sanctioned Principal
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-0.5 tracking-tight">
            {formatCurrency(totalSanctioned)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {activeLoans.length} active credit facilities
          </span>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Next Scheduled Repayment
          </span>
          <p className="text-lg font-bold text-amber-900 font-mono mt-0.5">
            ₹9,500.00
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Due on 01 Apr 2025 • Personal Loan #LN001
          </p>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Repayment Method
          </span>
          <p className="text-sm font-bold text-slate-800 mt-0.5">
            Auto-Debit via Savings A/C
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {maskAccountNumber("ACC001")} • No bounce penalties
          </p>
        </div>
      </div>

      {/* Loan Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Loan Contracts ({loans.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click "View EMIs" to expand or collapse installment schedules
          </span>
        </div>

        <div className="space-y-6">
          {loans.map((loan) => (
            <LoanCard
              key={loan.loanId}
              loan={loan}
              installments={installmentsMap[loan.loanId] || []}
              onPayEmi={handleOpenPayEmi}
            />
          ))}
        </div>
      </div>

      {/* DBMS Concept Callout */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 flex items-start gap-3">
        <Database className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">
            DBMS Relational Design: <code>LOAN (1) ──── (N) LOAN_INSTALLMENT</code>
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            In our relational schema, each installment row references <code>loan(loan_id)</code> with 
            <code>ON DELETE CASCADE</code>. Composite unique key constraint <code>UNIQUE (loan_id, installment_no)</code> 
            prevents duplicate scheduled EMIs.
          </p>
        </div>
      </div>

      {/* EMI Repayment Simulation Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={handleCloseModal}
        title="Simulated EMI Repayment"
        description={`${selectedLoan?.loanType} Loan #${selectedLoan?.loanId} • Installment #${selectedInstallment?.installmentNo}`}
        footer={
          paymentSuccess ? (
            <Button variant="primary" size="sm" onClick={handleCloseModal}>
              Done
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmEmiPayment}
                isLoading={processing}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Confirm Payment ({formatCurrency(selectedInstallment?.amount || 0)})
              </Button>
            </div>
          )
        }
      >
        {paymentSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Installment Payment Simulated!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              EMI #{selectedInstallment?.installmentNo} of{" "}
              <strong>{formatCurrency(selectedInstallment?.amount || 0)}</strong> has been marked as <strong>Paid</strong> in the simulator ledger.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 text-left space-y-1">
              <p>Receipt ID: RCP-EMI-{Date.now().toString().slice(-6)}</p>
              <p>Paid On: {new Date().toLocaleDateString("en-IN")}</p>
              <p>Auto-Debit Account: {maskAccountNumber("ACC001")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Scheduled EMI Amount:</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {formatCurrency(selectedInstallment?.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Official Due Date:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedInstallment?.dueDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Principal Facility:</span>
                <span className="font-semibold text-slate-800">
                  {selectedLoan?.loanType} Loan (#{selectedLoan?.loanId})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
              <span>
                Simulated settlement: Funds will be debited from your primary Savings Account (<code>{maskAccountNumber("ACC001")}</code>).
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoansPage;
