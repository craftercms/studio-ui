import cookies from "js-cookie";
import { setGlobalHeaders } from "./ajax";

export default function updateToken() {
  const token = cookies.get('XSRF-TOKEN');
  setGlobalHeaders({'X-XSRF-TOKEN': token});
}
