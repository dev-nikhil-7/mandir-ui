import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getVillages } from "../../api/tolas";
import { getEvents } from "../../api/chanda_events";
import { getTolaContributors } from "../../api/contributors";
const paymentModes = [
  { value: "2", label: "Cash" },
  { value: "1", label: "UPI" },
  { value: "3", label: "Bank Transfer" },
  { value: "4", label: "Cheque" },
];
import { createContribution } from "../../api/contributions";

import toast from "react-hot-toast"; // ✅ import
const schema = z.object({
  tola_id: z.number().min(1, "Tola is required"),
  contributor_id: z.number().min(1, "Contributor is required"),
  event_id: z.number().min(1, "Event is required"),
  payment_date: z.date().refine((val) => !!val, {
    message: "Payment date is required",
  }),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  payment_mode_id: z.string().min(1, "Payment mode is required"), // ✅ new
});

type FormData = z.infer<typeof schema>;

interface CollectChandaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CollectChandaModal({
  isOpen,
  onClose,
}: CollectChandaModalProps) {
  const [tolas, setTolas] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedTola = watch("tola_id");

  useEffect(() => {
    getVillages()
      .then(setTolas)
      .catch((err) => console.error("Error fetching villages:", err));
    getEvents()
      .then(setEvents)
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  useEffect(() => {
    if (selectedTola) {
      getTolaContributors(selectedTola)
        .then(setContributors)
        .catch((err) => console.error("Error fetching contributors:", err));
    } else {
      setContributors([]);
    }
  }, [selectedTola]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        payment_date: data.payment_date.toISOString().split("Z")[0],
        financial_year_id: 5,
      };

      await createContribution(payload);

      reset();
      onClose();

      // ✅ show success toast
      toast.success("Contribution saved successfully 🎉");

      // ✅ reload dashboard
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save contribution ❌");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}} // ❌ disable backdrop close
      className="relative z-50"
    >
      {/* Overlay (still shows, but click won’t close) */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-gray-900">
          {/* ✅ Close button inside */}
          <div className="px-6 py-4 flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
            <Dialog.Title className="text-lg font-semibold text-white">
              Collect Chanda
            </Dialog.Title>
            <button
              onClick={onClose} // ✅ manual close
              className="text-white/80 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Event */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event
              </label>
              <Controller
                name="event_id"
                control={control}
                render={({ field }) => {
                  const options = events.map((e) => ({
                    value: e.id,
                    label: e.name,
                  }));
                  return (
                    <Select
                      options={options}
                      value={
                        options.find((opt) => opt.value === field.value) || null
                      }
                      onChange={(val) => field.onChange(val ? val.value : null)}
                      placeholder="Select Event"
                    />
                  );
                }}
              />
              {errors.event_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.event_id.message}
                </p>
              )}
            </div>
            {/* Tola */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tola
              </label>
              <Controller
                name="tola_id"
                control={control}
                render={({ field }) => {
                  const options = tolas.map((t) => ({
                    value: t.id,
                    label: t.tola_name,
                  }));
                  return (
                    <Select
                      options={options}
                      value={
                        options.find((opt) => opt.value === field.value) || null
                      }
                      onChange={(val) => field.onChange(val ? val.value : null)}
                      placeholder="Select Tola"
                    />
                  );
                }}
              />
              {errors.tola_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tola_id.message}
                </p>
              )}
            </div>

            {/* Contributor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contributor
              </label>
              <Controller
                name="contributor_id"
                control={control}
                render={({ field }) => {
                  const options = contributors.map((c) => ({
                    value: c.id,
                    label: `${c.name} -  ₹ ${c.pledge_amount}`,
                  }));
                  return (
                    <Select
                      isDisabled={!selectedTola}
                      options={options}
                      value={
                        options.find((opt) => opt.value === field.value) || null
                      }
                      onChange={(val) => field.onChange(val ? val.value : null)}
                      placeholder={
                        !selectedTola
                          ? "Select Tola first"
                          : "Select Contributor"
                      }
                    />
                  );
                }}
              />
              {errors.contributor_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contributor_id.message}
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Date
              </label>
              <Controller
                name="payment_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="dd/MM/yyyy"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholderText="Select Payment Date"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Mode
              </label>
              <Controller
                name="payment_mode_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={paymentModes}
                    value={
                      paymentModes.find((opt) => opt.value === field.value) ||
                      null
                    }
                    onChange={(val) => field.onChange(val ? val.value : null)}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    {...field}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Enter Amount"
                  />
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
                type="button"
                onClick={onClose}
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
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
