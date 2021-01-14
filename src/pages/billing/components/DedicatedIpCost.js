//TODO: need to update the props everywhere this is used
export default function DedicatedIpCost({
  priceOfEachDedicatedIp,
  quantity,
  billingPeriodOfDedicatedIp,
}) {
  return `$${(priceOfEachDedicatedIp * quantity).toFixed(2)} per ${billingPeriodOfDedicatedIp}`;
}
