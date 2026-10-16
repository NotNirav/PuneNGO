import { redirect } from "next/navigation";

// Areas are listed on the causes page.
export default function AreasIndex() {
  redirect("/causes#areas");
}
