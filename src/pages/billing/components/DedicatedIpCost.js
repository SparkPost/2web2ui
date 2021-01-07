//TODO: need to update the props everywhere this is used
export default function DedicatedIpCost({ priceOfEachDedicatedIp, quantity }) {
  return `$${(priceOfEachDedicatedIp * quantity).toFixed(2)} per month`;
}
