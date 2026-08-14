import serviceHaircut from '../assets/services/service-haircut.webp'
import serviceStyling from '../assets/services/service-styling.webp'
import serviceColoring from '../assets/services/service-coloring.webp'
import serviceTreatment from '../assets/services/service-treatment.webp'

export const services = [
    {
        title: "haircut_services",
        image: serviceHaircut,
        items: [
            { name: "haircut_standard", price: "R$ 30" },
            { name: "beard_trim", price: "R$ 15" },
            { name: "classic_shave", price: "R$ 20" },
            { name: "coloring", price: "R$ 60" },
            { name: "mustache_trim", price: "R$ 10" },
            { name: "wash_dry", price: "R$ 40" }
        ]
    },
    {
        title: "skin_face",
        image: serviceStyling,
        items: [
            { name: "facial_bodyshop", price: "R$ 30" },
            { name: "facial_janseen", price: "R$ 15" },
            { name: "facial_herbal", price: "R$ 20" },
            { name: "facial_gold", price: "R$ 60" },
            { name: "facial_steaming", price: "R$ 10" },
            { name: "body_massage", price: "R$ 40" }
        ]
    },
    {
        title: "wax_design",
        image: serviceColoring,
        items: [
            { name: "eyebrow_design", price: "R$ 12" },
            { name: "full_face_wax", price: "R$ 25" },
            { name: "chest_wax", price: "R$ 35" },
            { name: "back_wax", price: "R$ 40" },
            { name: "arm_wax", price: "R$ 30" },
            { name: "leg_wax", price: "R$ 45" }
        ]
    },
    {
        title: "treatment_style",
        image: serviceTreatment,
        items: [
            { name: "keratin_treatment", price: "R$ 120" },
            { name: "hair_spa", price: "R$ 50" },
            { name: "deep_conditioning", price: "R$ 35" },
            { name: "scalp_treatment", price: "R$ 40" },
            { name: "hair_straightening", price: "R$ 80" },
            { name: "special_hairstyles", price: "R$ 60" }
        ]
    }
]
