"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  getUrlCustomDomains, 
  getAvailableDomainsForUrls, 
  activateDomainForUrls, 
  createUrlCustomDomain, 
  verifyUrlCustomDomain, 
  retryUrlCustomDomain, 
  checkUrlCustomDomainStatus, 
  removeUrlCustomDomain,
  type UrlCustomDomain,
  type AvailableDomain
} from '@/lib/api';
import { Globe, CheckCircle, XCircle, Clock, AlertCircle, Copy, ExternalLink, RefreshCw, Trash2, LinkIcon, ArrowRight } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

interface UrlCustomDomainConfigurationProps {
  onDomainUpdate?: () => void;
  hideHeader?: boolean;
  className?: string;
}

export default function UrlCustomDomainConfiguration({ onDomainUpdate, hideHeader = false, className = '' }: UrlCustomDomainConfigurationProps) {
  const t = useTranslations('urlCustomDomains');
  const [domains, setDomains] = useState<UrlCustomDomain[]>([]);
  const [availableDomains, setAvailableDomains] = useState<AvailableDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryingDomains, setRetryingDomains] = useState<Set<string>>(new Set());
  const [checkingDomains, setCheckingDomains] = useState<Set<string>>(new Set());
  const [activatingDomains, setActivatingDomains] = useState<Set<string>>(new Set());
  const [domainToDelete, setDomainToDelete] = useState<UrlCustomDomain | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadDomains = async () => {
    try {
      const [domainsResponse, availableResponse] = await Promise.all([
        getUrlCustomDomains(),
        getAvailableDomainsForUrls()
      ]);
      
      if (domainsResponse.success) {
        setDomains(domainsResponse.data || []);
      }
      
      if (availableResponse.success) {
        setAvailableDomains(availableResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading URL custom domains:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  // Auto-refresh para dominios en proceso
  useEffect(() => {
    const processingDomains = domains.filter(d => 
      ['pending', 'dns_configured', 'ssl_issued'].includes(d.status) || 
      retryingDomains.has(d.id) ||
      checkingDomains.has(d.id)
    );

    if (processingDomains.length === 0) return;

    const interval = setInterval(async () => {
      for (const domain of processingDomains) {
        if (domain.status === 'ssl_issued' && !checkingDomains.has(domain.id)) {
          await checkDomainStatus(domain.id);
        }
      }
      
      const prevRetryingDomains = new Set(retryingDomains);
      await loadDomains();
      
      prevRetryingDomains.forEach(domainId => {
        const domain = domains.find(d => d.id === domainId);
        if (domain && !['pending', 'dns_configured', 'ssl_issued'].includes(domain.status)) {
          setRetryingDomains(prev => {
            const newSet = new Set(prev);
            newSet.delete(domainId);
            return newSet;
          });
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [domains, retryingDomains, checkingDomains]);

  const addDomain = async () => {
    if (!newDomain.trim()) return;

    setIsLoading(true);
    try {
      const response = await createUrlCustomDomain(newDomain.trim());
      
      if (response.success) {
        setDomains(prev => [...prev, response.data]);
        setNewDomain('');
        onDomainUpdate?.();
        toast.success(t('domainAddedSuccess'));
      } else {
        toast.error(response.message || t('errorAddingDomain'));
      }
    } catch (error) {
      console.error('Error adding URL custom domain:', error);
      toast.error(t('errorAddingDomain'));
    } finally {
      setIsLoading(false);
    }
  };

  const activateDomain = async (domainId: string) => {
    if (activatingDomains.has(domainId)) return;

    setActivatingDomains(prev => new Set(prev.add(domainId)));
    
    try {
      const response = await activateDomainForUrls(domainId);
      
      if (response.success) {
        // Remove from available and add to active domains
        setAvailableDomains(prev => prev.filter(d => d.id !== domainId));
        setDomains(prev => [...prev, response.data]);
        onDomainUpdate?.();
        toast.success(t('domainActivated'));
      } else {
        toast.error(response.message || t('errorActivatingDomain'));
      }
    } catch (error) {
      console.error('Error activating domain for URLs:', error);
      toast.error(t('errorActivatingDomain'));
    } finally {
      setActivatingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domainId);
        return newSet;
      });
    }
  };

  const confirmRemoveDomain = async () => {
    if (!domainToDelete || isDeleting) return;

    setIsDeleting(true);
    
    try {
      const response = await removeUrlCustomDomain(domainToDelete.id);
      
      if (response.success) {
        toast.success(t('domainRemoved'));
        setDomainToDelete(null);
        loadDomains();
        onDomainUpdate?.();
      } else {
        toast.error(response.message || t('errorDeletingDomain'));
      }
    } catch (error) {
      console.error('Error removing URL custom domain:', error);
      toast.error(t('errorDeletingDomain'));
    } finally {
      setIsDeleting(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    try {
      const response = await verifyUrlCustomDomain(domainId);
      
      if (response.success) {
        toast.success(t('dnsVerifiedSuccess'));
        loadDomains();
      } else {
        toast.error(response.message || t('errorAddingDomain'));
      }
    } catch (error) {
      console.error('Error verifying URL custom domain:', error);
      toast.error(t('errorAddingDomain'));
    }
  };

  const retryDomain = async (domainId: string) => {
    if (retryingDomains.has(domainId)) {
      toast.error(t('retryInProgress'));
      return;
    }

    setRetryingDomains(prev => new Set(prev.add(domainId)));
    
    try {
      const response = await retryUrlCustomDomain(domainId);
      
      if (response.success) {
        toast.success(t('retrySuccess'));
      } else {
        toast.error(response.message || t('errorAddingDomain'));
        setTimeout(() => {
          setRetryingDomains(prev => {
            const newSet = new Set(prev);
            newSet.delete(domainId);
            return newSet;
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error retrying URL custom domain:', error);
      toast.error(t('errorAddingDomain'));
      
      setTimeout(() => {
        setRetryingDomains(prev => {
          const newSet = new Set(prev);
          newSet.delete(domainId);
          return newSet;
        });
      }, 2000);
    }
  };

  const checkDomainStatus = async (domainId: string, showLoading = false) => {
    if (showLoading) {
      setCheckingDomains(prev => new Set(prev.add(domainId)));
    }
    
    try {
      const response = await checkUrlCustomDomainStatus(domainId);
      
      if (response.success) {
        if (response.data.status === 'updated') {
          toast.success(response.data.message);
          loadDomains();
        } else if (showLoading) {
          toast(t('noChangesDetected'), { icon: 'ℹ️' });
        }
      }
    } catch (error) {
      console.error('Error checking URL custom domain status:', error);
      if (showLoading) {
        toast.error(t('errorAddingDomain'));
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente de configuración DNS';
      case 'dns_configured':
        return 'DNS configurado, generando certificado SSL...';
      case 'ssl_issued':
        return 'Certificado SSL emitido, activando...';
      case 'active':
        return 'Dominio activo y funcionando';
      case 'failed':
        return 'Error en la configuración';
      case 'removed':
        return 'Dominio removido, se puede reintentar';
      default:
        return 'Error en la configuración';
    }
  };

  if (initialLoading) {
    return (
      <div className={`bg-[#120724] border border-indigo-900/30 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className={`${hideHeader ? '' : 'border border-indigo-900/30 rounded-lg bg-[#120724]'} p-6`}>
        {!hideHeader && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg shadow-lg">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
                <p className="text-sm text-gray-400">{t('description')}</p>
              </div>
            </div>
          </>
        )}

        {/* Available Domains Section */}
        <AnimatePresence>
          {availableDomains.length > 0 && (
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-600/30 rounded-lg p-4 mb-4">
                <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {t('availableDomains')}
                </h4>
                <p className="text-sm text-gray-400 mb-3">{t('availableDomainsDescription')}</p>
                
                <div className="space-y-3">
                  {availableDomains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between bg-[#1c1033]/50 border border-gray-600/50 rounded-lg p-3">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">{domain.domain}</span>
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                          {t('sharedDomainInfo')}
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => activateDomain(domain.id)}
                        disabled={activatingDomains.has(domain.id)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium"
                      >
                        {activatingDomains.has(domain.id) ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                            {t('activating')}
                          </>
                        ) : (
                          <>
                            {t('activateDomain')}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </>
                        )}
                      </Button>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add new domain */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder={t('domainPlaceholder')}
              className="flex-1 bg-[#1c1033] border-gray-700 text-white focus:border-yellow-500"
            />
            <Button 
              onClick={addDomain}
              disabled={isLoading || !newDomain.trim()}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium"
            >
              {isLoading ? t('adding') : t('addDomain')}
            </Button>
          </div>

          <div className="text-sm text-gray-500 bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
            ⚠️ {t('dnsInstructions.domainOwnershipWarning')}
          </div>
        </div>

        {/* Existing domains */}
        {domains.length > 0 ? (
          <div className="mt-6 space-y-4">
            <h4 className="text-white font-medium">{t('configuredDomains')}</h4>
            
            {domains.map((domain) => (
              <div key={domain.id} className="border border-gray-600 rounded-lg p-4 bg-[#1c1033]/50">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getStatusIcon(domain.status, domain.id)}
                    <span className="text-white font-medium truncate">{domain.domain}</span>
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
                    {domain.supports_landing && (
                      <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
                        {t('sharedDomainInfo')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
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
                    {(domain.status === 'failed' || domain.status === 'dns_configured' || domain.status === 'removed' || domain.error_message) && domain.status !== 'active' && domain.status !== 'pending' && !retryingDomains.has(domain.id) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryDomain(domain.id)}
                        className="text-xs text-yellow-400 hover:text-yellow-300"
                      >
                        {t('retry')}
                      </Button>
                    )}
                    {retryingDomains.has(domain.id) && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={true}
                        className="text-xs text-blue-400 opacity-50 cursor-not-allowed"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                        {t('retrying')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDomainToDelete(domain)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      {t('remove')}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-3">
                  {getStatusText(domain.status)}
                </p>
                
                {/* Error messages */}
                {domain.error_message && (
                  <div className="text-sm mb-3 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-400 font-medium">Error:</p>
                        <p className="text-red-300 mt-1">{domain.error_message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DNS Instructions */}
                {domain.status === 'pending' && (
                  <div className="bg-gray-800/40 rounded-lg p-4 space-y-4">
                    <h5 className="text-white font-medium text-base">
                      {t('dnsInstructions.title')}
                    </h5>
                    <p className="text-base text-gray-300">
                      {t('dnsInstructions.description')}
                    </p>
                    
                    {/* Registro A principal */}
                    <div className="space-y-3">
                      <h6 className="text-white font-medium text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        {t('dnsInstructions.step1')}
                      </h6>
                      <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm border border-gray-700/50">
                        <div className="grid grid-cols-3 gap-4 text-gray-400 mb-2 font-medium">
                          <span>{t('dnsInstructions.recordType')}:</span>
                          <span>{t('dnsInstructions.recordName')}:</span>
                          <span>{t('dnsInstructions.recordValue')}:</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-white items-center">
                          <span className="bg-blue-900/30 px-2 py-1 rounded text-blue-200 font-medium">A</span>
                          <span className="font-medium">@</span>
                          <div className="flex items-center justify-between bg-gray-800/50 px-2 py-1 rounded">
                            <span>159.89.50.89</span>
                            <button 
                              onClick={() => copyToClipboard('159.89.50.89')}
                              className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-900/20 rounded transition-colors"
                              title={t('copiedToClipboard')}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registro TXT para verificación */}
                    <div className="space-y-3">
                      <h6 className="text-white font-medium text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        {t('dnsInstructions.step3')}
                      </h6>
                      <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm border border-gray-700/50">
                        <div className="grid grid-cols-3 gap-4 text-gray-400 mb-2 font-medium">
                          <span>{t('dnsInstructions.recordType')}:</span>
                          <span>{t('dnsInstructions.recordName')}:</span>
                          <span>{t('dnsInstructions.recordValue')}:</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-white items-center">
                          <span className="bg-yellow-900/30 px-2 py-1 rounded text-yellow-200 font-medium">TXT</span>
                          <div className="flex items-center justify-between bg-gray-800/50 px-2 py-1 rounded">
                            <span className="font-medium">_creator0x-url-verify</span>
                            <button 
                              onClick={() => copyToClipboard('_creator0x-url-verify')}
                              className="text-yellow-400 hover:text-yellow-300 p-1 hover:bg-yellow-900/20 rounded transition-colors flex-shrink-0"
                              title={t('copiedToClipboard')}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between bg-gray-800/50 px-2 py-1 rounded">
                            <span className="break-all truncate">{domain.verification_token}</span>
                            <button 
                              onClick={() => copyToClipboard(domain.verification_token)}
                              className="text-yellow-400 hover:text-yellow-300 p-1 hover:bg-yellow-900/20 rounded transition-colors ml-2 flex-shrink-0"
                              title={t('copiedToClipboard')}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 bg-gray-900/40 p-3 rounded">
                      <p className="font-medium mb-2">⚠️ {t('dnsInstructions.note')}</p>
                      <p className="text-xs">
                        Una vez configurado, podrás usar URLs como: <span className="text-yellow-300 font-mono">{domain.domain}/mi-enlace</span>
                      </p>
                    </div>
                  </div>
                )}
                </motion.div>
              </div>
            ))}
          </div>
        ) : availableDomains.length === 0 ? (
          <div className="mt-6">
            {/* Empty state */}
            <div className="text-center py-12">
              <LinkIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h4 className="font-medium text-gray-300 mb-2">{t('emptyState.title')}</h4>
              <p className="text-sm text-gray-400 mb-6">
                {t('emptyState.description')}
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-lg p-6">
              <h6 className="font-medium text-yellow-300 mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('emptyState.howItWorks')}
              </h6>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold mt-1">1.</span>
                  <span>{t('emptyState.step1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold mt-1">2.</span>
                  <span>{t('emptyState.step2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold mt-1">3.</span>
                  <span>{t('emptyState.step3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold mt-1">4.</span>
                  <span>{t('emptyState.step4')}</span>
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded">
                <p className="text-xs text-blue-200">
                  {t('emptyState.tip')}
                </p>
              </div>
            </div>
          </div>
        ) : null}
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
              {t('confirmRemoveTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>{t('confirmRemoveDescription')}</p>
                <p className="text-yellow-600 font-semibold">
                  {t('confirmRemoveWarning')}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
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
                t('confirmRemove')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}