import { serverFetch } from '@/lib/server-fetch';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const res = await serverFetch(req, `/api/${path.join('/')}`);
  return new Response(res.body, { status: res.status, headers: res.headers });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const body = await req.text();
  const res = await serverFetch(req, `/api/${path.join('/')}`, { method: 'POST', body });
  return new Response(res.body, { status: res.status, headers: res.headers });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const body = await req.text();
  const res = await serverFetch(req, `/api/${path.join('/')}`, { method: 'PATCH', body });
  return new Response(res.body, { status: res.status, headers: res.headers });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const res = await serverFetch(req, `/api/${path.join('/')}`, { method: 'DELETE' });
  return new Response(res.body, { status: res.status, headers: res.headers });
}
