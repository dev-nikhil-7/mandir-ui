import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Bhojpandaul Bhagwati Sthan"
        description="Bhojpandaul Bhagwati Sthan Admin Dashboard "
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
