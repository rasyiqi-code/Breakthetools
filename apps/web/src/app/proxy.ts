import { NextRequest, NextResponse } from 'next/server'

// Proxy file (pengganti middleware) - pass-through default
// Tambahkan rewrite/redirect/header logic di sini jika dibutuhkan nanti
export default function proxy(_request: NextRequest) {
	return NextResponse.next()
}
