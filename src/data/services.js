import serviceHaircut from '../assets/services/service-haircut.webp'
import serviceStyling from '../assets/services/service-styling.webp'
import serviceColoring from '../assets/services/service-coloring.webp'
import serviceTreatment from '../assets/services/service-treatment.webp'

export const services = [
    {
        title: "haircut_services",
        image: serviceHaircut,
        items: [
            { name: "haircut_standard", price: 30 },
            { name: "beard_trim", price: 15 },
            { name: "classic_shave", price: 20 },
            { name: "coloring", price: 60 },
            { name: "mustache_trim", price: 10 },
            { name: "wash_dry", price: 40 }
        ]
    },
    {
        title: "skin_face",
        image: serviceStyling,
        items: [
            { name: "facial_bodyshop", price: 30 },
            { name: "facial_janseen", price: 15 },
            { name: "facial_herbal", price: 20 },
            { name: "facial_gold", price: 60 },
            { name: "facial_steaming", price: 10 },
            { name: "body_massage", price: 40 }
        ]
    },
    {
        title: "wax_design",
        image: serviceColoring,
        items: [
            { name: "eyebrow_design", price: 12 },
            { name: "full_face_wax", price: 25 },
            { name: "chest_wax", price: 35 },
            { name: "back_wax", price: 40 },
            { name: "arm_wax", price: 30 },
            { name: "leg_wax", price: 45 }
        ]
    },
    {
        title: "treatment_style",
        image: serviceTreatment,
        items: [
            { name: "keratin_treatment", price: 120 },
            { name: "hair_spa", price: 50 },
            { name: "deep_conditioning", price: 35 },
            { name: "scalp_treatment", price: 40 },
            { name: "hair_straightening", price: 80 },
            { name: "special_hairstyles", price: 60 }
        ]
    }
]
