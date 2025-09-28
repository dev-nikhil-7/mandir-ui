import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactSelect from "react-select";
import { Dialog } from "@headlessui/react";

import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker";

import { getVillages } from "../../../api/tolas";
import { getTolaContributors } from "../../../api/contributors";
import { createContribution } from "../../../api/contributions";

import toast from "react-hot-toast";

/* ======================= Switch ======================= */
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

/* ======================= Schema ======================= */
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
    .or(z.literal("")),
  ...baseSchema,
});

const newContributorSchema = z.object({
  isNewContributor: z.literal(true),
  contributor_id: z.number().optional(),
  contributor_name: z.string().min(1, "Contributor name is required"),
  father_or_spouse_name: z.string().min(1, "Father/Spouse Name is required"),
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

const paymentModes = [
  { value: "2", label: "Cash" },
  { value: "1", label: "UPI" },
  { value: "3", label: "Bank Transfer" },
  { value: "4", label: "Cheque" },
];

/* ======================= Preview Modal ======================= */
function PreviewModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: (action?: "confirm" | "cancel") => void;
  data: FormData | null;
}) {
  if (!data) return null;

  const getPaymentModeLabel = (id: string) => {
    const mode = paymentModes.find((m) => m.value === id);
    return mode ? mode.label : id;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose("cancel")}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-lg w-full">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Preview Contribution
          </Dialog.Title>

          <div className="space-y-2 text-sm">
            <p>
              <b>Contributor:</b> {data.contributor_name}
            </p>
            <p>
              <b>Father/Spouse:</b> {data.father_or_spouse_name || "-"}
            </p>
            <p>
              <b>Contact:</b> {data.contact || "-"}
            </p>
            <p>
              <b>Receipt ID:</b> {data.receipt_id}
            </p>
            <p>
              <b>Date:</b>{" "}
              {data.payment_date instanceof Date
                ? data.payment_date.toLocaleDateString()
                : new Date(data.payment_date).toLocaleDateString()}
            </p>
            <p>
              <b>Mode:</b> {getPaymentModeLabel(data.payment_mode_id)}
            </p>
            <p>
              <b>Amount:</b> ₹{data.amount}
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => onClose("cancel")}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onClose("confirm")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              Confirm & Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

/* ======================= New Contributor Modal ======================= */
function NewContributorModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contributor: any, confirm?: boolean) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<FormData | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(newContributorSchema),
    defaultValues: {
      isNewContributor: true,
      contributor_name: "",
      father_or_spouse_name: "",
      contact: "",
      receipt_id: "",
      payment_date: new Date(),
      payment_mode_id: "",
      amount: undefined,
    },
  });

  const onPreview = (data: FormData) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-lg w-full">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add New Contributor
          </Dialog.Title>

          <form onSubmit={handleSubmit(onPreview)} className="space-y-3">
            {/* Contributor Name */}
            <Controller
              name="contributor_name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Contributor Name" />
              )}
            />
            {errors.contributor_name && (
              <p className="text-red-500 text-xs">
                {errors.contributor_name.message}
              </p>
            )}

            {/* Father/Spouse */}
            <Controller
              name="father_or_spouse_name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Father/Spouse Name" />
              )}
            />
            {errors.father_or_spouse_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.father_or_spouse_name.message}
              </p>
            )}

            {/* Contact */}
            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Contact (optional)" />
              )}
            />
            {errors.contact && (
              <p className="text-red-500 text-xs">{errors.contact.message}</p>
            )}

            {/* Receipt ID */}
            <Controller
              name="receipt_id"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Receipt ID"
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key))
                      e.preventDefault();
                  }}
                />
              )}
            />
            {errors.receipt_id && (
              <p className="text-red-500 text-xs">
                {errors.receipt_id.message}
              </p>
            )}

            {/* Payment Date */}
            <Controller
              name="payment_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="new-payment-date"
                  label="Payment Date"
                  defaultDate={field.value}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
            {errors.payment_date && (
              <p className="text-red-500 text-xs">
                {errors.payment_date.message}
              </p>
            )}

            {/* Payment Mode */}
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
              <p className="text-red-500 text-xs">
                {errors.payment_mode_id.message}
              </p>
            )}

            {/* Amount */}
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Enter Amount"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              )}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs">{errors.amount.message}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
              >
                Preview
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>

      {/* Preview */}
      <PreviewModal
        isOpen={showPreview}
        data={previewData}
        onClose={(action) => {
          setShowPreview(false);
          if (action === "confirm" && previewData) {
            onSave(previewData, true);
            reset();
            onClose();
          }
        }}
      />
    </Dialog>
  );
}

/* ======================= Main Form ======================= */
export default function CollectChandaForm() {
  const [tolas, setTolas] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<FormData | null>(null);
  const [showNewContributor, setShowNewContributor] = useState(false);

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
    resolver: zodResolver(schema) as any,
    defaultValues: {
      isNewContributor: false,
      contributor_id: 0,
      contributor_name: "",
      father_or_spouse_name: "",
      contact: "",
      receipt_id: "",
      payment_date: new Date(),
      amount: undefined,
      payment_mode_id: "",
    },
  });

  // Load villages
  useEffect(() => {
    getVillages().then(setTolas).catch(console.error);
  }, []);

  // Load contributors when Tola changes
  useEffect(() => {
    if (selectedTola) {
      getTolaContributors(selectedTola)
        .then(setContributors)
        .catch(console.error);
    } else {
      setContributors([]);
    }
  }, [selectedTola]);

  const actuallySaveContribution = async (data: FormData) => {
    if (!selectedTola) {
      toast.error("Please select Tola before submitting ❌");
      return;
    }

    try {
      const payload = {
        ...data,
        is_new_contributor: data.isNewContributor,
        tola_id: selectedTola,
        event_id: selectedEvent,
        payment_date: data.payment_date.toISOString().split("Z")[0],
        financial_year_id: 5,
      };

      delete (payload as any).isNewContributor;

      await createContribution(payload);

      reset();
      toast.success("Contribution saved successfully 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save contribution ❌");
    }
  };

  const onSubmit = (data: FormData) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
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
              options={tolas.map((t) => ({ value: t.id, label: t.tola_name }))}
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
        <ComponentCard title="Contribution Details">
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
                    if (val) setShowNewContributor(true);
                  }}
                  label={
                    field.value
                      ? "Adding New Contributor"
                      : "Using Existing Contributor"
                  }
                />
              )}
            />

            {/* Contributor (existing only) */}
            {!showNewContributor && (
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
                          setValue("contributor_name", val.label);
                          setValue("amount", val.pledge_amount);
                        } else {
                          field.onChange(0);
                          setValue("contributor_name", "");
                          setValue("amount", undefined);
                        }
                      }}
                      placeholder="Select Contributor"
                    />
                  )}
                />
                {errors.contributor_id && (
                  <p className="text-red-500 text-xs">
                    {errors.contributor_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Receipt ID */}
            <div>
              <Label>Receipt ID (Offline)</Label>
              <Controller
                name="receipt_id"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter Receipt ID"
                    {...field}
                  />
                )}
              />
              {errors.receipt_id && (
                <p className="text-red-500 text-xs">
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
                <p className="text-red-500 text-xs">
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
                <p className="text-red-500 text-xs">
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
                  <Input
                    type="number"
                    placeholder="Enter Amount"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs">{errors.amount.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="reset"
                onClick={() => reset()}
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

      {/* Modals */}
      <PreviewModal
        isOpen={showPreview}
        data={previewData}
        onClose={async (action) => {
          setShowPreview(false);
          if (action === "confirm" && previewData) {
            await actuallySaveContribution(previewData);
          }
        }}
      />

      <NewContributorModal
        isOpen={showNewContributor}
        onClose={() => setShowNewContributor(false)}
        onSave={async (contributor, confirm) => {
          setValue("contributor_name", contributor.contributor_name);
          setValue(
            "father_or_spouse_name",
            contributor.father_or_spouse_name || ""
          );
          setValue("contact", contributor.contact || "");
          setValue("receipt_id", contributor.receipt_id);
          setValue("payment_date", contributor.payment_date);
          setValue("payment_mode_id", contributor.payment_mode_id);
          setValue("amount", contributor.amount);
          setValue("isNewContributor", true);

          if (confirm) {
            await actuallySaveContribution({
              isNewContributor: true,
              ...contributor,
            } as FormData);
          }
        }}
      />
    </div>
  );
}
