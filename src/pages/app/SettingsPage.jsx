import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { FormField, Input } from '@/shared/components/Input'
import { tenantApi } from '@/entities/tenant/api/tenantApi'
import { useAuth } from '@/entities/auth/model/useAuth'
import { LANGUAGES } from '@/shared/constants/app'
import { cn } from '@/shared/utils/cn'

const LOGO_MAX_SIZE_BYTES = 5 * 1024 * 1024

function buildInitialFormValues(tenant) {
  return {
    companyEmail: tenant?.companyEmail || '',
    companyPhone: tenant?.companyPhone || '',
    companyAddress: tenant?.companyAddress || '',
  }
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser } = useAuth()
  const tenant = user?.tenant ?? null

  const [formValues, setFormValues] = useState(() => buildInitialFormValues(tenant))
  const [selectedLogo, setSelectedLogo] = useState(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  useEffect(() => {
    setFormValues(buildInitialFormValues(tenant))
  }, [tenant])

  useEffect(() => {
    if (!selectedLogo) {
      setLogoPreviewUrl(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(selectedLogo)
    setLogoPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedLogo])

  const displayedLogoUrl = logoPreviewUrl || tenant?.logoUrl || null

  function handleFieldChange(field) {
    return (event) => {
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0] || null
    event.target.value = ''

    if (!file) {
      setSelectedLogo(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.logoInvalidType'))
      return
    }

    if (file.size > LOGO_MAX_SIZE_BYTES) {
      toast.error(t('settings.logoTooLarge'))
      return
    }

    setSelectedLogo(file)
  }

  async function handleLogoUpload() {
    if (!selectedLogo) return

    setIsUploadingLogo(true)
    try {
      const response = await tenantApi.uploadLogo(selectedLogo)
      const updatedTenant = response.data?.tenant
      if (updatedTenant) {
        updateUser({ tenant: updatedTenant })
      }
      setSelectedLogo(null)
      toast.success(t('settings.logoUploaded'))
    } catch (err) {
      toast.error(err?.message || t('common.somethingWentWrong'))
    } finally {
      setIsUploadingLogo(false)
    }
  }

  async function handleSave(event) {
    event.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        companyEmail: formValues.companyEmail.trim() || null,
        companyPhone: formValues.companyPhone.trim() || null,
        companyAddress: formValues.companyAddress.trim() || null,
      }

      const response = await tenantApi.updateSettings(payload)
      const updatedTenant = response.data?.tenant
      if (updatedTenant) {
        updateUser({ tenant: updatedTenant })
      }
      toast.success(t('settings.updated'))
    } catch (err) {
      toast.error(err?.message || t('common.somethingWentWrong'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <div className="max-w-2xl space-y-5">
        <Card padding="lg">
          <h2 className="mb-1 text-base font-semibold text-text-primary">
            {t('settings.companyBranding')}
          </h2>
          <p className="mb-5 text-sm text-text-secondary">
            {t('settings.companyBrandingDescription')}
          </p>

          <div className="space-y-5">
            <FormField
              label={t('settings.logo')}
              hint={t('settings.logoHint')}
            >
              <div className="rounded-md border border-dashed border-border bg-surface-subtle p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {displayedLogoUrl ? (
                      <img
                        src={displayedLogoUrl}
                        alt={tenant?.name || t('invoices.companyFallback')}
                        className="h-16 w-auto max-w-[120px] rounded-md object-contain"
                      />
                    ) : (
                      <div className="flex h-16 w-[120px] items-center justify-center rounded-md border border-border bg-surface text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        {tenant?.name || t('invoices.companyFallback')}
                      </div>
                    )}

                    <div className="text-sm text-text-secondary">
                      <p className="font-medium text-text-primary">{t('settings.logo')}</p>
                      <p>{t('settings.logoHint')}</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleLogoUpload}
                    disabled={!selectedLogo}
                    isLoading={isUploadingLogo}
                    className="w-full sm:w-auto"
                  >
                    {t('settings.uploadLogo')}
                  </Button>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="mt-4 block w-full text-sm text-text-secondary file:me-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/15"
                />
              </div>
            </FormField>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                type="email"
                label={t('settings.companyEmail')}
                value={formValues.companyEmail}
                onChange={handleFieldChange('companyEmail')}
                placeholder={t('common.email')}
              />

              <Input
                label={t('settings.companyPhone')}
                value={formValues.companyPhone}
                onChange={handleFieldChange('companyPhone')}
                placeholder={t('common.phone')}
              />

              <FormField label={t('settings.companyAddress')}>
                <textarea
                  rows={4}
                  value={formValues.companyAddress}
                  onChange={handleFieldChange('companyAddress')}
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-text-primary transition-colors duration-200 placeholder:text-text-muted focus:border-primary focus:outline-none focus:shadow-focus"
                  placeholder={t('settings.companyAddress')}
                />
              </FormField>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isSaving}>
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-base font-semibold text-text-primary mb-4">
            {t('settings.language')}
          </h2>
          <div className="flex gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={cn(
                  'flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-colors',
                  i18n.language === lang.code
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-border text-text-secondary hover:border-gray-300 hover:text-text-primary'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
