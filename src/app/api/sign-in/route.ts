import { setToken } from '@/actions/set-token'
import { api } from '@/lib/api'
import { signInSchema } from '@/schemas'
import { AxiosError } from 'axios'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const payload = signInSchema.safeParse(body)

  if (!payload.success) {
    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 400 },
    )
  }

  try {
    const res = await api.post('/sign-in', payload.data)

    if (res.status !== 200) {
      return NextResponse.json(res.data, { status: res.status })
    }

    const { token } = res.data

    await setToken(token)

    return NextResponse.json(token, { status: res.status })
  } catch (error) {
    console.log('Sign in error', error)
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'Erro ao acessar o servidor' },
          { status: 500 },
        )
      }

      return NextResponse.json(
        { error: error.response?.data.error as string },
        { status: error.response?.status },
      )
    }
  }
}
