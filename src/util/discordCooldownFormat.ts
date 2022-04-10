export default function discordCooldownFormat(currentTime: number, leftTime: number) {
  const timestamp = Math.floor((currentTime + leftTime)/1000);
  return `<t:${timestamp}:f> (<t:${timestamp}:R>)`;
}