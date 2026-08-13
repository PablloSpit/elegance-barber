import serviceHaircut from '../assets/services/service-haircut.webp'
import serviceStyling from '../assets/services/service-styling.webp'
import serviceColoring from '../assets/services/service-coloring.webp'
import serviceTreatment from '../assets/services/service-treatment.webp'

export const services = [
    {
        title: "Serviços de Cabelo",
        items: [
            { name: "Corte de Cabelo", price: "R$ 30" },
            { name: "Aparo de Barba", price: "R$ 15" },
            { name: "Barbear Clássico", price: "R$ 20" },
            { name: "Coloração", price: "R$ 60" },
            { name: "Aparo de Bigode", price: "R$ 10" },
            { name: "Lavagem e Secagem", price: "R$ 40" }
        ],
        image: serviceHaircut
    },
    {
        title: "Pele e Rosto",
        items: [
            { name: "Limpeza Facial Bodyshop", price: "R$ 30" },
            { name: "Limpeza Facial Janseen", price: "R$ 15" },
            { name: "Limpeza Facial Herbal", price: "R$ 20" },
            { name: "Limpeza Facial Gold", price: "R$ 60" },
            { name: "Vaporização Facial", price: "R$ 10" },
            { name: "Massagem Corporal", price: "R$ 40" }
        ],
        image: serviceStyling
    },
    {
        title: "Cera e Design",
        items: [
            { name: "Design de Sobrancelha", price: "R$ 12" },
            { name: "Depilação Facial Completa", price: "R$ 25" },
            { name: "Depilação de Peito", price: "R$ 35" },
            { name: "Depilação de Costas", price: "R$ 40" },
            { name: "Depilação de Braço", price: "R$ 30" },
            { name: "Depilação de Perna", price: "R$ 45" }
        ],
        image: serviceColoring
    },
    {
        title: "Tratamentos e Estilo",
        items: [
            { name: "Tratamento de Queratina", price: "R$ 120" },
            { name: "Spa Capilar", price: "R$ 50" },
            { name: "Condicionamento Profundo", price: "R$ 35" },
            { name: "Tratamento do Couro Cabeludo", price: "R$ 40" },
            { name: "Alisamento", price: "R$ 80" },
            { name: "Penteados Especiais", price: "R$ 60" }
        ],
        image: serviceTreatment
    }
]
