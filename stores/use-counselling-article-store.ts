import { CounsellingArticle } from '@/lib/api'
import { create } from 'zustand'

interface CounsellingArticleStore {
  article: CounsellingArticle | null
  setArticle: (article: CounsellingArticle) => void
  clearArticle: () => void
}

export const useCounsellingArticleStore = create<CounsellingArticleStore>((set) => ({
  article: null,
  setArticle: (article: CounsellingArticle) => set({ article }),
  clearArticle: () => set({ article: null }),
}))