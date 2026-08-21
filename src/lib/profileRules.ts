import { EducationStage,UserProfile } from '@/types/checklist'

export const isSecondaryEducationStage=(stage?:EducationStage)=>stage==='secondary'
export const isSecondaryStudent=(profile:UserProfile)=>isSecondaryEducationStage(profile.educationStage)
