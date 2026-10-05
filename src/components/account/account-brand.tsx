import Image from "next/image";
import Link from "next/link";
/** Official homepage brand composition: vector icon and wordmark, never stretched artwork. */
export function AccountBrand() {
  return (
    <Link href="/" className="account-brand" aria-label="WYRPlay home">
      <Image src="/brand/logo.svg" width={40} height={40} alt="" priority />
      <span>WYRPLAY</span>
    </Link>
  );
}
