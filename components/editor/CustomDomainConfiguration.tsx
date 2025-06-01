"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/api';
import { Globe, CheckCircle, XCircle, Clock, AlertCircle, Copy, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CustomDomain {
  id: string;
  domain: string;
  status: 'pending' | 'dns_configured' | 'ssl_issued' | 'active' | 'failed' | 'removed';
  verification_token: string;
  verification_type: 'txt' | 'cname';
  ssl_status: 'pending' | 'issued' | 'failed' | 'expired';
  error_message?: string;
  created_at: string;
}

interface CustomDomainConfigurationProps {
  landingId: string;
  onDomainUpdate?: () => void;
  hideHeader?: boolean; // Para usar dentro de accordeon
}


export default function CustomDomainConfiguration({ landingId, onDomainUpdate, hideHeader = false }: CustomDomainConfigurationProps) {
  const t = useTranslations('customDomains');
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryingDomains, setRetryingDomains] = useState<Set<string>>(new Set());
  const [checkingDomains, setCheckingDomains] = useState<Set<string>>(new Set());
  const [showInstructions, setShowInstructions] = useState<string | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<CustomDomain | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const createAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadDomains = async () => {
    try {
      const response = await fetch(`${API_URL}/api/custom-domains?landingId=${landingId}`, {
        headers: createAuthHeaders()
      });
      
      if (response.ok) {
        const { data } = await response.json();
        setDomains(data || []);
      }
    } catch (error) {
      console.error('Error loading domains:', error);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [landingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh para dominios en proceso
  useEffect(() => {
    const processingDomains = domains.filter(d => 
      ['pending', 'dns_configured', 'ssl_issued'].includes(d.status) || 
      retryingDomains.has(d.id) ||
      checkingDomains.has(d.id)
    );

    if (processingDomains.length === 0) return;

    const interval = setInterval(async () => {
      // Verificar estado de dominios que llevan mucho tiempo procesando
      for (const domain of processingDomains) {
        if (domain.status === 'ssl_issued' && !checkingDomains.has(domain.id)) {
          await checkDomainStatus(domain.id);
        }
      }
      
      // Refresh general
      loadDomains();
    }, 5000); // Refresh cada 5 segundos

    return () => clearInterval(interval);
  }, [domains, retryingDomains, checkingDomains]); // eslint-disable-line react-hooks/exhaustive-deps

  const addDomain = async () => {
    if (!newDomain.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/custom-domains`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({
          landingId,
          domain: newDomain.trim()
        })
      });

      if (response.ok) {
        const { data } = await response.json();
        setDomains(prev => [...prev, data]);
        setNewDomain('');
        setShowInstructions(data.id);
        onDomainUpdate?.();
        toast.success(t('domainAddedSuccess'));
      } else {
        const error = await response.json();
        const message = getErrorMessage(t, error.code, error.type) || error.message || t('errors.unknownError');
        toast.error(message);
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      alert('Error adding domain');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRemoveDomain = async () => {
    if (!domainToDelete || isDeleting) return;

    console.log('Confirming domain deletion:', domainToDelete);
    setIsDeleting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/custom-domains/${domainToDelete.id}`, {
        method: 'DELETE',
        headers: createAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove domain');
      }

      toast.success('Dominio eliminado correctamente');
      setDomainToDelete(null);
      loadDomains();
      onDomainUpdate?.();
    } catch (error) {
      console.error('Error removing domain:', error);
      toast.error('Error al eliminar el dominio');
    } finally {
      setIsDeleting(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/custom-domains/${domainId}/verify`, {
        method: 'POST',
        headers: createAuthHeaders()
      });

      if (response.ok) {
        toast.success(t('dnsVerifiedSuccess'));
        loadDomains(); // Reload to get updated status
      } else {
        const error = await response.json();
        const message = getErrorMessage(t, error.code, error.type) || error.message || t('errors.unknownError');
        toast.error(message);
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error(t('errors.connectionError'));
    }
  };

  const retryDomain = async (domainId: string) => {
    // Prevenir múltiples retries del mismo dominio
    if (retryingDomains.has(domainId)) {
      toast.error('Ya hay un proceso de reintento en curso para este dominio');
      return;
    }

    setRetryingDomains(prev => new Set(prev.add(domainId)));
    
    try {
      const response = await fetch(`${API_URL}/api/custom-domains/${domainId}/retry`, {
        method: 'POST',
        headers: createAuthHeaders()
      });

      if (response.ok) {
        toast.success(t('retrySuccess'));
        loadDomains(); // Reload to get updated status
      } else {
        const error = await response.json();
        const message = getErrorMessage(t, error.code, error.type) || error.message || t('errors.unknownError');
        toast.error(message);
      }
    } catch (error) {
      console.error('Error retrying domain:', error);
      toast.error(t('errors.connectionError'));
    } finally {
      // Mantener el estado de retry por más tiempo para evitar clicks múltiples
      setTimeout(() => {
        setRetryingDomains(prev => {
          const newSet = new Set(prev);
          newSet.delete(domainId);
          return newSet;
        });
      }, 3000); // 3 segundos de delay adicional
    }
  };

  const checkDomainStatus = async (domainId: string, showLoading = false) => {
    if (showLoading) {
      setCheckingDomains(prev => new Set(prev.add(domainId)));
    }
    
    try {
      const response = await fetch(`${API_URL}/api/custom-domains/${domainId}/check-status`, {
        method: 'POST',
        headers: createAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'updated') {
          toast.success(result.message);
          loadDomains(); // Reload to get updated status
        } else {
          console.log('Domain status check:', result);
          if (showLoading) {
            toast(t('noChangesDetected'), { icon: 'ℹ️' });
          }
        }
      }
    } catch (error) {
      console.error('Error checking domain status:', error);
      if (showLoading) {
        toast.error(t('errors.connectionError'));
      }
    } finally {
      if (showLoading) {
        setCheckingDomains(prev => {
          const newSet = new Set(prev);
          newSet.delete(domainId);
          return newSet;
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copiedToClipboard'));
  };

  // Función para traducir códigos de error
  const getErrorMessage = (t: any, code: string, type?: string) => {
    switch (code) {
      case 'DNS_VERIFICATION_FAILED':
        return t('errors.dnsVerificationFailed', { type: type?.toUpperCase() || 'DNS' });
      case 'DNS_QUERY_ERROR':
        return t('errors.dnsQueryError');
      case 'DOMAIN_ALREADY_EXISTS':
        return t('errors.domainAlreadyExists');
      case 'INVALID_DOMAIN':
        return t('errors.invalidDomain');
      case 'SSL_GENERATION_FAILED':
        return t('errors.sslGenerationFailed');
      case 'SSL_TIMEOUT':
        return t('errors.sslTimeout');
      case 'SSL_RATE_LIMIT':
        return t('errors.sslRateLimit');
      case 'SSL_VALIDATION_FAILED':
        return t('errors.sslValidationFailed');
      case 'INVALID_RETRY_STATE':
        return t('errors.invalidRetryState');
      case 'VPS_CONNECTION_FAILED':
        return t('errors.vpsConnectionFailed');
      case 'SSL_PROCESS_BUSY':
        return t('errors.sslProcessBusy');
      default:
        return t('errors.unknownError');
    }
  };

  const getStatusIcon = (status: string, domainId: string) => {
    if (retryingDomains.has(domainId) || checkingDomains.has(domainId)) {
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'removed':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'ssl_issued':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
      case 'dns_configured':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string, sslStatus?: string) => {
    switch (status) {
      case 'pending':
        return t('status.pending');
      case 'dns_configured':
        return t('status.dnsConfigured');
      case 'ssl_issued':
        return t('status.sslIssued');
      case 'active':
        return t('status.active');
      case 'failed':
        return t('status.failed');
      case 'removed':
        return t('status.removed');
      default:
        return t('status.failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${hideHeader ? '' : 'border border-gray-700/50 rounded-lg bg-gray-800/20'} p-6`}>
        {!hideHeader && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              {t('description')}
            </p>
          </>
        )}

        {/* Add new domain */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder={t('domainPlaceholder')}
              className="flex-1 bg-gray-900/50 border-gray-600 text-white"
            />
            <Button 
              onClick={addDomain}
              disabled={isLoading || !newDomain.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? t('adding') : t('addDomain')}
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            ⚠️ Asegúrate de que el dominio te pertenece y tienes acceso a su configuración DNS
          </div>
        </div>

        {/* Existing domains */}
        {domains.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="text-white font-medium">{t('configuredDomains')}</h4>
            
            {domains.map((domain) => (
              <div key={domain.id} className="border border-gray-600 rounded-lg p-4 bg-gray-900/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(domain.status, domain.id)}
                    <span className="text-white font-medium">{domain.domain}</span>
                    {domain.status === 'active' && (
                      <a 
                        href={`https://${domain.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {domain.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => verifyDomain(domain.id)}
                        className="text-xs"
                      >
                        {t('verify')}
                      </Button>
                    )}
                    {domain.status === 'ssl_issued' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => checkDomainStatus(domain.id, true)}
                        disabled={checkingDomains.has(domain.id)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        {checkingDomains.has(domain.id) ? t('checking') : t('checkStatus')}
                      </Button>
                    )}
                    {(domain.status === 'failed' || domain.status === 'dns_configured' || domain.status === 'removed' || domain.error_message) && domain.status !== 'active' && domain.status !== 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryDomain(domain.id)}
                        disabled={retryingDomains.has(domain.id)}
                        className="text-xs text-yellow-400 hover:text-yellow-300"
                      >
                        {retryingDomains.has(domain.id) ? t('retrying') : t('retry')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log('Remove button clicked for domain:', domain);
                        setDomainToDelete(domain);
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      {t('remove')}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-3">
                  {getStatusText(domain.status, domain.ssl_status)}
                </p>


                {domain.error_message && (
                  <div className="text-sm mb-3 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-400 font-medium">Error:</p>
                        <p className="text-red-300 mt-1">{domain.error_message}</p>
                        {domain.status === 'failed' && (
                          <p className="text-red-400/70 text-xs mt-2">
                            {t('retryHint')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* DNS Instructions */}
                {domain.status === 'pending' && (
                  <div className="bg-gray-800/40 rounded-lg p-4 space-y-4">
                    <h5 className="text-white font-medium text-sm">
                      {t('dnsInstructions.title')}
                    </h5>
                    <p className="text-sm text-gray-300">
                      {t('dnsInstructions.description')}
                    </p>
                    
                    {/* Registro A principal */}
                    <div className="space-y-3">
                      <h6 className="text-white font-medium text-xs">{t('dnsInstructions.step1')}</h6>
                      <div className="bg-gray-900/50 rounded p-3 font-mono text-xs">
                        <div className="grid grid-cols-4 gap-3 text-gray-400 mb-2">
                          <span>{t('dnsInstructions.recordType')}:</span>
                          <span>{t('dnsInstructions.recordName')}:</span>
                          <span>{t('dnsInstructions.recordValue')}:</span>
                          <span>{t('dnsInstructions.ttl')}:</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-white">
                          <span>A</span>
                          <span>@</span>
                          <span>142.93.40.80</span>
                          <span>300</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard('142.93.40.80')}
                          className="mt-2 text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar IP
                        </button>
                      </div>
                    </div>

                    {/* Registro A para www */}
                    <div className="space-y-3">
                      <h6 className="text-white font-medium text-xs">{t('dnsInstructions.step2')}</h6>
                      <div className="bg-gray-900/50 rounded p-3 font-mono text-xs">
                        <div className="grid grid-cols-4 gap-3 text-gray-400 mb-2">
                          <span>{t('dnsInstructions.recordType')}:</span>
                          <span>{t('dnsInstructions.recordName')}:</span>
                          <span>{t('dnsInstructions.recordValue')}:</span>
                          <span>{t('dnsInstructions.ttl')}:</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-white">
                          <span>A</span>
                          <span>www</span>
                          <span>142.93.40.80</span>
                          <span>300</span>
                        </div>
                      </div>
                    </div>

                    {/* Registro TXT para verificación */}
                    <div className="space-y-3">
                      <h6 className="text-white font-medium text-xs">{t('dnsInstructions.step3')}</h6>
                      <div className="bg-gray-900/50 rounded p-3 font-mono text-xs">
                        <div className="grid grid-cols-3 gap-4 text-gray-400 mb-2">
                          <span>{t('dnsInstructions.recordType')}:</span>
                          <span>{t('dnsInstructions.recordName')}:</span>
                          <span>{t('dnsInstructions.recordValue')}:</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-white">
                          <span>TXT</span>
                          <span>_creator0x-verify</span>
                          <span className="break-all">{domain.verification_token}</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(domain.verification_token)}
                          className="mt-2 text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar token
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('dnsInstructions.verificationNote')}
                      </p>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-900/40 p-3 rounded">
                      <p className="font-medium mb-2">⚠️ {t('dnsInstructions.note')}</p>
                      <strong>Instrucciones:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Ve al panel de control de tu proveedor de dominios</li>
                        <li>Busca la sección de &quot;DNS&quot; o &quot;Zona DNS&quot;</li>
                        <li>Agrega los registros A mostrados arriba</li>
                        <li>Agrega el registro TXT para verificación</li>
                        <li>{t('dnsInstructions.step4')}</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar dominio */}
      <AlertDialog open={!!domainToDelete} onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setDomainToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Eliminar Dominio Personalizado
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  ¿Estás seguro de que quieres eliminar el dominio <strong>{domainToDelete?.domain}</strong>?
                </p>
                <p>Esta acción no se puede deshacer.</p>
                <p className="text-yellow-600 font-semibold">
                  ⚠️ Esto eliminará permanentemente el dominio y su certificado SSL de nuestros servidores.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveDomain}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Eliminando...
                </div>
              ) : (
                'Eliminar Dominio'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}