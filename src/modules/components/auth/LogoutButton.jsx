import { useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabaseClient'

export default function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('access_token') // if used for fetch()
    navigate('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
    >
      Logout
    </button>
  )
}
