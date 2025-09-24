import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactSelect from "react-select";

import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker.tsx";

import { getVillages } from "../../../api/tolas";
import { getTolaContributors } from "../../../api/contributors";
import { createContribution } from "../../../api/contributions";

import toast from "react-hot-toast";

// ✅ Custom Switch
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          checked ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          aria-hidden
          className={`absolute left-0 flex items-center justify-center w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </label>
  );
}

const paymentModes = [
  { value: "2", label: "Cash" },
  { value: "1", label: "UPI" },
  { value: "3", label: "Bank Transfer" },
  { value: "4", label: "Cheque" },
];

// ✅ Schema
const baseSchema = {
  receipt_id: z.string().min(1, "Receipt ID is required"),
  payment_date: z.date(),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  payment_mode_id: z.string().min(1, "Payment mode is required"),
};

const existingContributorSchema = z.object({
  isNewContributor: z.literal(false),
  contributor_id: z.number().min(1, "Contributor is required"),
  contributor_name: z.string().optional(),
  father_or_spouse_name: z.string().optional(),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")), // ✅ optional contact for old contributors
  ...baseSchema,
});

const newContributorSchema = z.object({
  isNewContributor: z.literal(true),
  contributor_id: z.number().optional(),
  contributor_name: z.string().min(1, "Contributor name is required"),
  father_or_spouse_name: z.string().min(1, "Father/Spouse name is required"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  ...baseSchema,
});

const schema = z.discriminatedUnion("isNewContributor", [
  existingContributorSchema,
  newContributorSchema,
]);

type FormData = z.infer<typeof schema>;

export default function CollectChandaForm() {
  const [tolas, setTolas] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [isNewContributor, setIsNewContributor] = useState(false);

  const event = { id: 1, name: "Durga Pooja 2025" };
  const [selectedEvent] = useState<number>(event.id);
  const [selectedTola, setSelectedTola] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any, // ✅ fix TS red underline
    defaultValues: {
      isNewContributor: false,
      contributor_id: 0,
      contributor_name: "",
      father_or_spouse_name: "",
      contact: "",
      receipt_id: "",
      payment_date: new Date(),
      amount: 0,
      payment_mode_id: "",
    },
  });

  // ✅ Load villages
  useEffect(() => {
    getVillages().then(setTolas).catch(console.error);
  }, []);

  // ✅ Load contributors when Tola changes
  useEffect(() => {
    if (selectedTola) {
      getTolaContributors(selectedTola)
        .then(setContributors)
        .catch(console.error);
    } else {
      setContributors([]);
    }
  }, [selectedTola]);

  const onSubmit = async (data: FormData) => {
    if (!selectedTola) {
      toast.error("Please select Tola before submitting ❌");
      return;
    }

    try {
      const payload = {
        ...data,
        is_new_contributor: data.isNewContributor, // ✅ map camelCase → snake_case
        tola_id: selectedTola,
        event_id: selectedEvent,
        payment_date: data.payment_date.toISOString().split("Z")[0],
        financial_year_id: 5,
      };

      delete (payload as any).isNewContributor; // remove camelCase

      await createContribution(payload);

      reset({
        isNewContributor: false,
        contributor_id: 0,
        contributor_name: "",
        father_or_spouse_name: "",
        contact: "",
        receipt_id: "",
        payment_date: new Date(),
        amount: 0,
        payment_mode_id: "",
      });

      toast.success("Contribution saved successfully 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save contribution ❌");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================== Event & Tola ================== */}
      <ComponentCard title="Collect Chanda">
        <div className="space-y-4">
          <div>
            <Label>Event</Label>
            <Input type="text" value={event.name} disabled />
          </div>

          <div>
            <Label>Tola</Label>
            <ReactSelect
              isSearchable
              options={tolas.map((t) => ({
                value: t.id,
                label: t.tola_name,
              }))}
              value={
                tolas
                  .map((t) => ({ value: t.id, label: t.tola_name }))
                  .find((opt) => opt.value === selectedTola) || null
              }
              onChange={(val) => setSelectedTola(val ? val.value : null)}
              placeholder="Select Tola"
            />
          </div>
        </div>
      </ComponentCard>

      {selectedTola ? (
        <ComponentCard title="Collect Chanda">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Switch */}
            <Controller
              name="isNewContributor"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setIsNewContributor(val);
                  }}
                  label={
                    field.value
                      ? "Adding New Contributor"
                      : "Using Existing Contributor"
                  }
                />
              )}
            />

            {/* Contributor / New Contributor */}
            {!isNewContributor ? (
              <>
                <div>
                  <Label>Contributor</Label>
                  <Controller
                    name="contributor_id"
                    control={control}
                    render={({ field }) => (
                      <ReactSelect
                        isSearchable
                        options={contributors.map((c) => ({
                          value: c.id,
                          label: `${c.name} - ₹ ${c.pledge_amount}`,
                          pledge_amount: c.pledge_amount,
                        }))}
                        value={
                          contributors
                            .map((c) => ({
                              value: c.id,
                              label: `${c.name} - ₹ ${c.pledge_amount}`,
                              pledge_amount: c.pledge_amount,
                            }))
                            .find((opt) => opt.value === field.value) || null
                        }
                        onChange={(val) => {
                          if (val) {
                            field.onChange(val.value);
                            setValue("amount", val.pledge_amount);
                          } else {
                            field.onChange(0);
                            setValue("amount", 0);
                          }
                        }}
                        placeholder="Select Contributor"
                      />
                    )}
                  />
                  {errors.contributor_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contributor_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Contact (optional)</Label>
                  <Controller
                    name="contact"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="tel"
                        placeholder="Enter Mobile Number"
                        maxLength={10}
                        {...field}
                      />
                    )}
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contact.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Contributor Name</Label>
                  <Controller
                    name="contributor_name"
                    control={control}
                    render={({ field }) => (
                      <Input type="text" placeholder="Enter Name" {...field} />
                    )}
                  />
                  {errors.contributor_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contributor_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Father/Spouse Name</Label>
                  <Controller
                    name="father_or_spouse_name"
                    control={control}
                    render={({ field }) => (
                      <Input type="text" placeholder="Enter Name" {...field} />
                    )}
                  />
                  {errors.father_or_spouse_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.father_or_spouse_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Contact</Label>
                  <Controller
                    name="contact"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="tel"
                        placeholder="Enter Mobile Number"
                        maxLength={10}
                        {...field}
                      />
                    )}
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.contact.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Receipt ID */}
            <div>
              <Label>Receipt ID (Offline)</Label>
              <Controller
                name="receipt_id"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="Enter Receipt ID"
                    {...field}
                  />
                )}
              />
              {errors.receipt_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.receipt_id.message}
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <Controller
                name="payment_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="payment-date"
                    label="Payment Date"
                    placeholder="Select Payment Date"
                    defaultDate={field.value}
                    onChange={(date) => field.onChange(date)}
                  />
                )}
              />
              {errors.payment_date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.payment_date.message}
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <Label>Payment Mode</Label>
              <Controller
                name="payment_mode_id"
                control={control}
                render={({ field }) => (
                  <ReactSelect
                    options={paymentModes}
                    value={
                      paymentModes.find((opt) => opt.value === field.value) ||
                      null
                    }
                    onChange={(val) => field.onChange(val ? val.value : "")}
                    placeholder="Select Payment Mode"
                  />
                )}
              />
              {errors.payment_mode_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.payment_mode_id.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <Label>Amount</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input type="number" placeholder="Enter Amount" {...field} />
                )}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="reset"
                onClick={() =>
                  reset({
                    isNewContributor: false,
                    contributor_id: 0,
                    contributor_name: "",
                    father_or_spouse_name: "",
                    contact: "",
                    receipt_id: "",
                    payment_date: new Date(),
                    amount: 0,
                    payment_mode_id: "",
                  })
                }
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        </ComponentCard>
      ) : (
        <p className="text-sm text-gray-500">
          ⚠️ Please select <b>Tola</b> to continue.
        </p>
      )}
    </div>
  );
}
