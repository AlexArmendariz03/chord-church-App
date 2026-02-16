import Head from "next/head";
import LoginComponent from "@/components/auth/login-component";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Ingreso | Chord Church</title>
      </Head>
      <LoginComponent />
    </>
  );
}
