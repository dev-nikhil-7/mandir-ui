import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactSelect from "react-select";

import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";

import { getVillages } from "../../../api/tolas";
import {
  getTolaContributors,
  updateContributor,
} from "../../../api/contributors";

import toast from "react-hot-toast";

// ✅ Schema
const schema = z.object({
  contributor_id: z.number().min(1, "Contributor is required"),
  name: z.string().min(1, "Name is required"),
  father_or_spouse_name: z.string().min(1, "Father/Spouse name is required"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  pledge_amount: z.coerce
    .number()
    .positive("Pledge amount must be greater than zero"),
});

type FormData = z.infer<typeof schema>;

export default function UpdateContributorForm() {
  const [tolas, setTolas] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [selectedTola, setSelectedTola] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contributor_id: 0,
      name: "",
      father_or_spouse_name: "",
      contact: "",
      pledge_amount: 0,
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
    try {
      await updateContributor(data.contributor_id, data);

      toast.success("Contributor & pledge updated successfully 🎉");

      reset({
        contributor_id: 0,
        name: "",
        father_or_spouse_name: "",
        contact: "",
        pledge_amount: 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update contributor ❌");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================== Select Tola ================== */}
      <ComponentCard title="Update Contributor - Select Tola">
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
      </ComponentCard>

      {/* ================== Update Contributor ================== */}
      {selectedTola ? (
        <ComponentCard title="Update Contributor">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contributor Select */}
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
                      name: c.name,
                      father_or_spouse_name: c.father_or_spouse_name,
                      contact: c.contact,
                      pledge_amount: c.pledge_amount,
                    }))}
                    value={
                      contributors
                        .map((c) => ({
                          value: c.id,
                          label: `${c.name} - ₹ ${c.pledge_amount}`,
                        }))
                        .find((opt) => opt.value === field.value) || null
                    }
                    onChange={(val) => {
                      if (val) {
                        field.onChange(val.value);
                        setValue("name", val.name || "");
                        setValue(
                          "father_or_spouse_name",
                          val.father_or_spouse_name || ""
                        );
                        setValue("contact", val.contact || "");
                        setValue("pledge_amount", val.pledge_amount || 0);
                      } else {
                        field.onChange(0);
                        reset();
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

            {/* Name */}
            <div>
              <Label>Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input type="text" placeholder="Enter Name" {...field} />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Father/Spouse Name */}
            <div>
              <Label>Father/Spouse Name</Label>
              <Controller
                name="father_or_spouse_name"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="Enter Father/Spouse Name"
                    {...field}
                  />
                )}
              />
              {errors.father_or_spouse_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.father_or_spouse_name.message}
                </p>
              )}
            </div>

            {/* Contact */}
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

            {/* Pledge Amount */}
            <div>
              <Label>Pledge Amount</Label>
              <Controller
                name="pledge_amount"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="Enter Pledge Amount"
                    {...field}
                  />
                )}
              />
              {errors.pledge_amount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.pledge_amount.message}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="reset"
                onClick={() =>
                  reset({
                    contributor_id: 0,
                    name: "",
                    father_or_spouse_name: "",
                    contact: "",
                    pledge_amount: 0,
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
                Update
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
