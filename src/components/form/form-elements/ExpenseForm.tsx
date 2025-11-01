import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../input/InputField";
import Label from "../Label";
import ComponentCard from "../../common/ComponentCard";
import toast from "react-hot-toast";
import API from "../../../api/client";

// ✅ Schema
const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  //   expense_type: z.string().min(1, "Expense type is required"),
  //   paid_by: z.string().min(1, "Paid by is required"),
  //   approved_by: z.string().min(1, "Approved by is required"),
  //   payment_mode: z.string().min(1, "Payment mode is required"),
  //   date_of_expense: z.string().min(1, "Date of expense is required"),
});

type FormData = z.infer<typeof schema>;

export default function ExpenseForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      description: "",
      //   expense_type: "",
      //   paid_by: "",
      //   approved_by: "",
      //   payment_mode: "",
      //   date_of_expense: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        event_id: 1,
        financial_year_id: 5,
      };

      await API.post("/api/v1/expenses", payload);

      toast.success("Expense added successfully 🎉");

      reset({
        amount: 0,
        description: "",
        // expense_type: "",
        // paid_by: "",
        // approved_by: "",
        // payment_mode: "",
        // date_of_expense: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense ❌");
    }
  };

  return (
    <ComponentCard title="Add Expense">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Amount */}
        <div>
          <Label>Amount (₹)</Label>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input type="number" placeholder="Enter amount" {...field} />
            )}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="Enter description" {...field} />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Expense Type */}
        {/* <div>
          <Label>Expense Type</Label>
          <Controller
            name="expense_type"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="e.g. Decoration, Food, etc."
                {...field}
              />
            )}
          />
          {errors.expense_type && (
            <p className="text-red-500 text-xs mt-1">
              {errors.expense_type.message}
            </p>
          )}
        </div> */}

        {/* Paid By */}
        {/* <div>
          <Label>Paid By</Label>
          <Controller
            name="paid_by"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="Enter payer name" {...field} />
            )}
          />
          {errors.paid_by && (
            <p className="text-red-500 text-xs mt-1">
              {errors.paid_by.message}
            </p>
          )}
        </div> */}

        {/* Approved By */}
        {/* <div>
          <Label>Approved By</Label>
          <Controller
            name="approved_by"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="Enter approver name" {...field} />
            )}
          />
          {errors.approved_by && (
            <p className="text-red-500 text-xs mt-1">
              {errors.approved_by.message}
            </p>
          )}
        </div> */}

        {/* Payment Mode */}
        {/* <div>
          <Label>Payment Mode</Label>
          <Controller
            name="payment_mode"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="e.g. Cash, UPI, Bank"
                {...field}
              />
            )}
          />
          {errors.payment_mode && (
            <p className="text-red-500 text-xs mt-1">
              {errors.payment_mode.message}
            </p>
          )}
        </div> */}

        {/* Date of Expense */}
        {/* <div>
          <Label>Date of Expense</Label>
          <Controller
            name="date_of_expense"
            control={control}
            render={({ field }) => (
              <Input type="date" placeholder="Select date" {...field} />
            )}
          />
          {errors.date_of_expense && (
            <p className="text-red-500 text-xs mt-1">
              {errors.date_of_expense.message}
            </p>
          )}
        </div> */}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="reset"
            onClick={() =>
              reset({
                amount: 0,
                description: "",
                expense_type: "",
                paid_by: "",
                approved_by: "",
                payment_mode: "",
                date_of_expense: "",
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
            Submit
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}
