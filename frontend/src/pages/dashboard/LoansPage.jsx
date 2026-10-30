import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import loanService from "../../services/loanService";
import loanInstallmentService from "../../services/loanInstallmentService";
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
  const [paymentReceipt, setPaymentReceipt] = useState(null);
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

  // Execute paying an EMI via live Spring Boot REST API
  const handleConfirmEmiPayment = async () => {
    if (!selectedLoan || !selectedInstallment) return;

    try {
      setProcessing(true);
      const updatedInst = await loanInstallmentService.payInstallment(
        selectedLoan.loanId,
        selectedInstallment.installmentId
      );

      // Update installment state locally with live DB response
      setInstallmentsMap((prevMap) => {
        const currentLoanInsts = prevMap[selectedLoan.loanId] || [];
        const updated = currentLoanInsts.map((inst) =>
          inst.installmentId === selectedInstallment.installmentId
            ? { ...inst, ...updatedInst, status: "Paid", paidOn: updatedInst.paidOn || new Date().toISOString().split("T")[0] }
            : inst
        );
        return { ...prevMap, [selectedLoan.loanId]: updated };
      });

      setPaymentReceipt({
        id: `RCP-${updatedInst.installmentId || selectedInstallment.installmentId}`,
        date: updatedInst.paidOn || new Date().toLocaleDateString("en-IN"),
      });
      setPaymentSuccess(true);
    } catch (err) {
      console.error("Failed to execute EMI payment", err);
      alert(err.response?.data?.message || "Failed to process EMI payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setPaymentModalOpen(false);
    setSelectedLoan(null);
    setSelectedInstallment(null);
    setPaymentSuccess(false);
    setPaymentReceipt(null);
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
          {activeLoans.length > 0 ? (
            <>
              <p className="text-lg font-bold text-amber-900 font-mono mt-0.5">
                Active Repayment
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Scheduled installment • Loan #{activeLoans[0].loanId}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">
                No Pending Repayments
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                No active credit installments due
              </p>
            </>
          )}
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Repayment Method
          </span>
          {activeLoans.length > 0 ? (
            <>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                Auto-Debit via Linked A/C
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Electronic Mandate Active
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">
                Not Applicable
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                No active mandate required
              </p>
            </>
          )}
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

        {loans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-600 font-medium">No loans or credit facilities found</p>
            <p className="text-xs text-slate-400 mt-1">
              You currently have no active personal or retail borrowing contracts with ASR Bank.
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* EMI Repayment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={handleCloseModal}
        title="Repay Scheduled EMI"
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
              Installment Payment Successful!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              EMI #{selectedInstallment?.installmentNo} of{" "}
              <strong>{formatCurrency(selectedInstallment?.amount || 0)}</strong> has been settled and marked as <strong>Paid</strong> and credited to your loan balance.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 text-left space-y-1">
              <p>Receipt ID: {paymentReceipt?.id || "RCP-EMI-104928"}</p>
              <p>Paid On: {paymentReceipt?.date || "01/10/2026"}</p>
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
                Auto-debit authorization: Funds will be debited directly from your primary Savings Account (<code>{maskAccountNumber("ACC001")}</code>).
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoansPage;
