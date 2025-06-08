import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

import AvatarDisplaySelector from '../components/editor/AvatarDisplaySelector'
import BackgroundGradientSelector from '../components/editor/BackgroundGradientSelector'
import BackgroundPatternSelector from '../components/editor/BackgroundPatternSelector'
import BorderRadiusSelector from '../components/editor/BorderRadiusSelector'
import CustomDomainConfiguration from '../components/editor/CustomDomainConfiguration'
import EffectsSelector from '../components/editor/EffectsSelector'
import FontColorSelector from '../components/editor/FontColorSelector'
import FontFamilySelector from '../components/editor/FontFamilySelector'
import LinkColorSelector from '../components/editor/LinkColorSelector'
import LinkImageStyleSelector from '../components/editor/LinkImageStyleSelector'
import MultiSectionsBoard from '../components/editor/MultiSectionsBoard'
import MultiSectionsContainer from '../components/editor/MultiSectionsContainer'
import MultiSectionsItem from '../components/editor/MultiSectionsItem'
import SocialLinksPanel from '../components/editor/SocialLinksPanel'
import StyleCustomizationAccordion from '../components/editor/StyleCustomizationAccordion'
import ThemeSelector from '../components/editor/ThemeSelector'
import TitleStyleSelector from '../components/editor/TitleStyleSelector'

import { AvatarUpload } from '../components/editor/AvatarUpload'
import { GuideOverlay } from '../components/editor/GuideOverlay'
import { GuideOverlayV2 } from '../components/editor/GuideOverlayV2'
import { ImageCropModal } from '../components/editor/ImageCropModal'
import { LandingAvatarUpload } from '../components/editor/LandingAvatarUpload'
import { LandingInfoEditor } from '../components/editor/LandingInfoEditor'
import { MobileEditorNavigation } from '../components/editor/MobileEditorNavigation'
import { SmartGuideOverlay } from '../components/editor/SmartGuideOverlay'
import { SortableSocialItem } from '../components/editor/SortableSocialItem'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('react-image-crop', () => ({ __esModule: true, default: (props: any) => <div {...props} /> }))
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
  useSensor: () => ({}),
  useSensors: () => [],
  PointerSensor: {},
  KeyboardSensor: {},
  closestCorners: () => {},
  closestCenter: () => {}
}))
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false
  })
}))
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null, refreshUserProfile: vi.fn() }) }))

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) }))
})

describe('editor components render', () => {
  const tests: [string, JSX.Element][] = [
    ['AvatarDisplaySelector', <AvatarDisplaySelector value={{ showAvatar: true }} onChange={() => {}} onSave={() => {}} />],
    ['BackgroundGradientSelector', <BackgroundGradientSelector value={{ color1: '#000', color2: '#fff' }} onChange={() => {}} />],
    ['BackgroundPatternSelector', <BackgroundPatternSelector value={{ pattern: 'grid', color: '#000', opacity: 0.5 }} onChange={() => {}} onSave={() => {}} />],
    ['BorderRadiusSelector', <BorderRadiusSelector value="rounded" onChange={() => {}} />],
    ['CustomDomainConfiguration', <CustomDomainConfiguration landingId="1" />],
    ['EffectsSelector', <EffectsSelector currentConfig={{}} onConfigUpdate={() => {}} onConfigSave={() => {}} />],
    ['FontColorSelector', <FontColorSelector value={{ primary: '#000', secondary: '#fff' }} onChange={() => {}} />],
    ['FontFamilySelector', <FontFamilySelector value={{ family: 'Inter', url: '' }} onChange={() => {}} />],
    ['LinkColorSelector', <LinkColorSelector value={{ background: '#000', text: '#fff' }} onChange={() => {}} />],
    ['LinkImageStyleSelector', <LinkImageStyleSelector value={{ borderRadius: '0px' }} onChange={() => {}} />],
    ['MultiSectionsBoard', <MultiSectionsBoard landingId="1" links={[]} setLinks={() => {}} sections={[]} setSections={() => {}} onUpdateLink={() => {}} onDeleteLink={() => {}} onUpdateSection={() => {}} onDeleteSection={() => {}} onCreateSection={() => {}} />],
    ['MultiSectionsContainer', <MultiSectionsContainer containerId="c" items={[]} links={[]} sections={[]} moveSectionUp={() => {}} moveSectionDown={() => {}} idx={0} total={0} onUpdateLink={() => {}} onDeleteLink={() => {}} onCreateLinkInSection={() => {}} onUpdateSection={() => {}} onDeleteSection={() => {}} reorderLinksInContainer={() => {}} onMoveToSection={() => {}} transitioningLinks={new Set()} activeId={null} highlightedLinkId={null} />],
    ['MultiSectionsItem', <MultiSectionsItem link={{ id: '1', title: '', url: '', visible: true, position: 0 }} onUpdateLink={() => {}} onDeleteLink={() => {}} onMoveToSection={() => {}} availableSections={[]} />],
    ['SocialLinksPanel', <SocialLinksPanel landingId="1" />],
    ['StyleCustomizationAccordion', <StyleCustomizationAccordion landing={{}} handleConfigurationUpdate={() => {}} handleConfigurationSave={() => {}} handleThemeUpdate={() => {}} onAvatarUpdate={() => {}} />],
    ['ThemeSelector', <ThemeSelector onThemeChange={() => {}} />],
    ['TitleStyleSelector', <TitleStyleSelector value={{}} onChange={() => {}} onSave={() => {}} />],
    ['AvatarUpload', <AvatarUpload />],
    ['GuideOverlay', <GuideOverlay onScrollToSection={() => {}} />],
    ['GuideOverlayV2', <GuideOverlayV2 onScrollToSection={() => {}} />],
    ['ImageCropModal', <ImageCropModal isOpen imageSrc="" onClose={() => {}} onCropComplete={() => {}} />],
    ['LandingAvatarUpload', <LandingAvatarUpload landingId="1" onAvatarUpdate={() => {}} />],
    ['LandingInfoEditor', <LandingInfoEditor landingId="1" onInfoUpdate={() => {}} />],
    ['MobileEditorNavigation', <MobileEditorNavigation activeSection="" onSectionChange={() => {}} />],
    ['SmartGuideOverlay', <SmartGuideOverlay onScrollToSection={() => {}} />],
    ['SortableSocialItem', <SortableSocialItem id="1" data={{ id: '1', name: 'x', url: '', visible: true, position: 0 }} onToggleVisibility={() => {}} onUrlChange={() => {}} />]
  ]

  tests.forEach(([name, element]) => {
    it(`renders ${name}`, () => {
      expect(() => render(element)).not.toThrow()
    })
  })
})
