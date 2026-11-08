import React, { useState, useMemo } from 'react';
import { Calculator, MessageCircle, AlertCircle, Calendar, IndianRupee, Percent } from 'lucide-react';
import {
  calculateLoanEMI,
  formatINR,
  buildWhatsAppUrl,
  PRIMARY_WHATSAPP,
} from '../utils/loanCalculator';
import { Language, UI_TEXT } from '../data/translations';

export function LoanCalculator({
  lang,
  onSelectLoanEnquiry,
}: {
  lang: Language;
  onSelectLoanEnquiry?: (summary: string) => void;
}) {
  const t = UI_TEXT[lang].loanCalculator;

  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(10.5);
  const [tenureValue, setTenureValue] = useState<number>(5);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [loanType, setLoanType] = useState<string>('Personal / Home / Business Loan');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const tenureMonths = useMemo(() => {
    return tenureUnit === 'years' ? tenureValue * 12 : tenureValue;
  }, [tenureValue, tenureUnit]);

  const result = useMemo(() => {
    return calculateLoanEMI(loanAmount, interestRate, tenureMonths);
  }, [loanAmount, interestRate, tenureMonths]);

  const handleUnitSwitch = (newUnit: 'years' | 'months') => {
    if (newUnit === tenureUnit) return;
    if (newUnit === 'months') {
      setTenureValue(Math.min(360, Math.max(6, tenureValue * 12)));
    } else {
      setTenureValue(Math.min(30, Math.max(1, Math.round(tenureValue / 12))));
    }
    setTenureUnit(newUnit);
  };

  const whatsappMessage = useMemo(() => {
    return `Hello M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), I used the Loan EMI Calculator on your website and would like to discuss a loan:\n• Loan Category: ${loanType}\n• Loan Amount: ${formatINR(result.principal)}\n• Expected Interest Rate: ${result.annualInterestRate}% p.a.\n• Tenure: ${result.tenureMonths} months\n• Estimated EMI: ${formatINR(result.monthlyEMI)}/month\nPlease guide me on the required documents and eligibility.`;
  }, [loanType, result]);

  const whatsappHref = buildWhatsAppUrl(whatsappMessage, PRIMARY_WHATSAPP);

  const presetAmounts = [
    { label: '₹1 Lakh', value: 100000 },
    { label: '₹5 Lakh', value: 500000 },
    { label: '₹15 Lakh', value: 1500000 },
    { label: '₹35 Lakh', value: 3500000 },
  ];

  return (
    <section
      id="loan-calculator"
      aria-labelledby="loan-calculator-heading"
      className="py-16 bg-[#09152B] text-white border-y border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-semibold tracking-wider uppercase text-[#E5C158] mb-2">
            {t.kicker}
          </div>
          <h2
            id="loan-calculator-heading"
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance"
          >
            {t.heading}
          </h2>
          <p className="mt-3 text-slate-300 text-base leading-relaxed">{t.subheading}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Sliders & Inputs */}
          <div className="lg:col-span-7 bg-[#0F213C] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-7 shadow-xl">
            {/* Loan Category Selector */}
            <div>
              <label
                htmlFor="calc-loan-category"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
              >
                {lang === 'en' ? 'Select Loan Type for Consultation' : 'ਲੋਨ ਦੀ ਕਿਸਮ ਚੁਣੋ'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Personal Loan', labelEn: 'Personal Loan', labelPa: 'ਪਰਸਨਲ ਲੋਨ' },
                  { id: 'Home Loan', labelEn: 'Home Loan', labelPa: 'ਹੋਮ ਲੋਨ' },
                  { id: 'Car Loan', labelEn: 'Car Loan', labelPa: 'ਕਾਰ ਲੋਨ' },
                  { id: 'Business Loan', labelEn: 'Business Loan', labelPa: 'ਬਿਜ਼ਨਸ ਲੋਨ' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLoanType(item.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                      loanType === item.id
                        ? 'bg-[#C69C3A] text-slate-950 border-[#C69C3A]'
                        : 'bg-[#09152B] text-slate-200 border-white/10 hover:border-[#C69C3A]/50'
                    }`}
                  >
                    {lang === 'en' ? item.labelEn : item.labelPa}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Loan Amount Input */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="loan-amount-input"
                  className="text-sm font-semibold text-slate-100 flex items-center gap-1.5"
                >
                  <IndianRupee className="w-4 h-4 text-[#E5C158]" />
                  {t.loanAmountLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="loan-amount-input"
                    type="number"
                    min={25000}
                    max={10000000}
                    step={10000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Math.max(1000, Number(e.target.value) || 0))}
                    className="w-40 px-3 py-1.5 rounded-lg bg-[#071124] border border-white/20 text-right font-tabular text-[#E5C158] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C3A]"
                  />
                </div>
              </div>
              <input
                type="range"
                aria-label={t.loanAmountLabel}
                min={25000}
                max={10000000}
                step={25000}
                value={Math.min(10000000, Math.max(25000, loanAmount))}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-[#C69C3A] cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-xs text-slate-400 font-tabular">₹25,000</span>
                <div className="flex items-center gap-1.5">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setLoanAmount(preset.value)}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10 transition-colors font-tabular whitespace-nowrap shrink-0"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-tabular">₹1,00,00,000</span>
              </div>
            </div>

            {/* 2. Interest Rate Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="interest-rate-input"
                  className="text-sm font-semibold text-slate-100 flex items-center gap-1.5"
                >
                  <Percent className="w-4 h-4 text-[#E5C158]" />
                  {t.interestRateLabel}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="interest-rate-input"
                    type="number"
                    min={6}
                    max={30}
                    step={0.25}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value) || 0))}
                    className="w-28 px-3 py-1.5 rounded-lg bg-[#071124] border border-white/20 text-right font-tabular text-[#E5C158] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C3A]"
                  />
                  <span className="text-xs text-slate-300 font-tabular">%</span>
                </div>
              </div>
              <input
                type="range"
                aria-label={t.interestRateLabel}
                min={6.5}
                max={24}
                step={0.25}
                value={Math.min(24, Math.max(6.5, interestRate))}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#C69C3A] cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-xs text-slate-400 font-tabular">
                <span>6.5% p.a.</span>
                <span>12.0% p.a.</span>
                <span>18.0% p.a.</span>
                <span>24.0% p.a.</span>
              </div>
            </div>

            {/* 3. Loan Duration Input */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="loan-tenure-input"
                  className="text-sm font-semibold text-slate-100 flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-[#E5C158]" />
                  {t.tenureLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="loan-tenure-input"
                    type="number"
                    min={1}
                    max={tenureUnit === 'years' ? 30 : 360}
                    value={tenureValue}
                    onChange={(e) => setTenureValue(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 px-3 py-1.5 rounded-lg bg-[#071124] border border-white/20 text-right font-tabular text-[#E5C158] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C3A]"
                  />
                  <div className="inline-flex rounded-lg bg-[#071124] p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => handleUnitSwitch('years')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        tenureUnit === 'years'
                          ? 'bg-[#C69C3A] text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.yearsUnit}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitSwitch('months')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        tenureUnit === 'months'
                          ? 'bg-[#C69C3A] text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.monthsUnit}
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="range"
                aria-label={t.tenureLabel}
                min={tenureUnit === 'years' ? 1 : 6}
                max={tenureUnit === 'years' ? 30 : 360}
                step={tenureUnit === 'years' ? 1 : 6}
                value={tenureValue}
                onChange={(e) => setTenureValue(Number(e.target.value))}
                className="w-full accent-[#C69C3A] cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-xs text-slate-400 font-tabular">
                <span>{tenureUnit === 'years' ? '1 Year' : '6 Months'}</span>
                <span>
                  {result.tenureMonths} {lang === 'en' ? 'Monthly Installments' : 'ਮਹੀਨਾਵਾਰ ਕਿਸ਼ਤਾਂ'}
                </span>
                <span>{tenureUnit === 'years' ? '30 Years' : '360 Months'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Calculation Results Card */}
          <div className="lg:col-span-5 bg-[#0F213C] border border-[#C69C3A]/35 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="pb-5 border-b border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {t.monthlyEmiLabel} ({loanType})
              </div>
              <div
                data-testid="calculated-monthly-emi"
                className="mt-2 text-4xl sm:text-5xl font-extrabold text-[#E5C158] font-tabular tracking-tight"
              >
                {formatINR(result.monthlyEMI)}
                <span className="text-base font-normal text-slate-300 ml-1.5">/ mo</span>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>
                  {t.principalLabel}: <strong className="font-tabular text-white">{result.principalPercentage}%</strong>
                </span>
                <span>
                  {t.totalInterestLabel}: <strong className="font-tabular text-[#E5C158]">{result.interestPercentage}%</strong>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#071124] overflow-hidden flex border border-white/10">
                <div
                  className="bg-sky-400 h-full transition-all duration-200"
                  style={{ width: `${result.principalPercentage}%` }}
                />
                <div
                  className="bg-[#C69C3A] h-full transition-all duration-200"
                  style={{ width: `${result.interestPercentage}%` }}
                />
              </div>
            </div>

            {/* Breakdown Metrics */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#071124] border border-white/10">
                <span className="text-sm text-slate-300">{t.principalLabel}</span>
                <span
                  data-testid="calculated-principal"
                  className="text-base font-bold text-white font-tabular"
                >
                  {formatINR(result.principal)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#071124] border border-white/10">
                <span className="text-sm text-slate-300">{t.totalInterestLabel}</span>
                <span
                  data-testid="calculated-interest"
                  className="text-base font-bold text-[#E5C158] font-tabular"
                >
                  {formatINR(result.totalInterest)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#C69C3A]/10 border border-[#C69C3A]/35">
                <span className="text-sm font-semibold text-slate-100">{t.totalRepaymentLabel}</span>
                <span
                  data-testid="calculated-total-repayment"
                  className="text-lg font-extrabold text-[#E5C158] font-tabular"
                >
                  {formatINR(result.totalRepayment)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl bg-[#C69C3A] hover:bg-[#D4AD47] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{t.discussBtn}</span>
              </a>

              {onSelectLoanEnquiry && (
                <button
                  type="button"
                  onClick={() =>
                    onSelectLoanEnquiry(
                      `${loanType} enquiry for ${formatINR(result.principal)} over ${result.tenureMonths} months (Estimated EMI ${formatINR(result.monthlyEMI)}/mo)`
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/15 transition-colors whitespace-nowrap"
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {lang === 'en'
                      ? 'Send Loan Details to Admin'
                      : 'ਇਹ ਲੋਨ ਵੇਰਵਾ ਐਡਮਿਨ ਨੂੰ ਭੇਜੋ'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full text-center text-xs text-amber-300 hover:text-amber-200 underline pt-1"
              >
                {showSchedule
                  ? lang === 'en'
                    ? 'Hide Yearly Repayment Schedule'
                    : 'ਸਾਲਾਨਾ ਭੁਗਤਾਨ ਸੂਚੀ ਲੁਕਾਓ'
                  : lang === 'en'
                  ? 'View Yearly Repayment Schedule'
                  : 'ਸਾਲਾਨਾ ਭੁਗਤਾਨ ਸੂਚੀ ਦੇਖੋ'}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Expandable Yearly Amortization Table */}
        {showSchedule && (
          <div className="mt-8 bg-[#0B1E47] border border-white/15 rounded-2xl p-6 overflow-x-auto">
            <h3 className="text-base font-bold text-amber-300 mb-4">{t.scheduleHeading}</h3>
            <table className="w-full text-left border-collapse text-sm font-tabular">
              <thead>
                <tr className="border-b border-white/15 text-slate-300 text-xs uppercase">
                  <th className="py-2.5 px-3">{t.yearCol}</th>
                  <th className="py-2.5 px-3">{t.principalCol}</th>
                  <th className="py-2.5 px-3">{t.interestCol}</th>
                  <th className="py-2.5 px-3">{t.balanceCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {result.yearlyBreakdown.slice(0, 15).map((row) => (
                  <tr key={row.year} className="hover:bg-white/5">
                    <td className="py-2.5 px-3 font-semibold text-amber-300">Year {row.year}</td>
                    <td className="py-2.5 px-3 text-white">{formatINR(row.principalPaid)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{formatINR(row.interestPaid)}</td>
                    <td className="py-2.5 px-3 text-slate-200">{formatINR(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mandatory Non-Guarantee Disclaimer */}
        <div className="mt-8 rounded-xl bg-slate-950/90 border border-amber-400/30 p-4 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>{t.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
