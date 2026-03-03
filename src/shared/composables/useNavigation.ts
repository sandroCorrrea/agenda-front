import { useRouter } from 'vue-router'

export function useNavigation() {
    const router = useRouter()

    function irPara(nome: string, params?: Record<string, any>) {
        router.push({
            name: nome,
            params
        })
    }

    return {
        irPara
    }
}