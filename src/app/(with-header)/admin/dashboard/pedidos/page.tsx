import { Orders } from "@/components/dashboard/orders";
import { getToken } from "@/lib/getToken";




export default async function Pedidos() {

    const token = await getToken();


    return (
        <Orders token={token!} />
    )
}