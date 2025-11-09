 export default async function Meeting({
  params,
}: {
  params: Promise<{ id : string }>
}) {
  const { id } = await params
  return <div>Meeting Room: #{id}</div>
}