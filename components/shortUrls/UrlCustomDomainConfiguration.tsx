"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  checkDomainImpact,
  verifyUrlDomainDNS,
  retryUrlDomainSSL,
  getUrlDomainStatus,
  type UrlCustomDomain,
  type AvailableDomain
} from '@/lib/api';
import { Globe, CheckCircle, XCircle, Clock, AlertCircle, Copy, ExternalLink, RefreshCw, Trash2, LinkIcon, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
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
  const [deleteImpact, setDeleteImpact] = useState<any>(null);
  const [showImpactDialog, setShowImpactDialog] = useState(false);

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
      ['pending', 'dns_configured', 'ssl_issued', 'ssl_pending'].includes(d.status) || 
      retryingDomains.has(d.id) ||
      checkingDomains.has(d.id)
    );

    if (processingDomains.length === 0) return;

    const interval = setInterval(async () => {
      for (const domain of processingDomains) {
        if ((domain.status === 'ssl_issued' || domain.status === 'ssl_pending') && !checkingDomains.has(domain.id)) {
          await checkDomainStatus(domain.id);
        }
      }
      
      const prevRetryingDomains = new Set(retryingDomains);
      await loadDomains();
      
      prevRetryingDomains.forEach(domainId => {
        const domain = domains.find(d => d.id === domainId);
        if (domain && !['pending', 'dns_configured', 'ssl_issued', 'ssl_pending'].includes(domain.status)) {
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

  const handleRemoveDomain = async (domain: UrlCustomDomain) => {
    try {
      // First check the impact
      const impactResponse = await checkDomainImpact(domain.id);
      
      if (impactResponse.success) {
        setDeleteImpact(impactResponse.data);
        setDomainToDelete(domain);
        
        // If there are affected URLs, show the impact dialog
        if (impactResponse.data.affectedUrlsCount > 0) {
          setShowImpactDialog(true);
        } else {
          // No URLs affected, proceed with standard confirmation
          setShowImpactDialog(false);
        }
      } else {
        toast.error('Failed to assess domain impact');
      }
    } catch (error) {
      console.error('Error checking domain impact:', error);
      toast.error('Failed to assess domain impact');
    }
  };

  const confirmRemoveDomain = async (force: boolean = false) => {
    if (!domainToDelete || isDeleting) return;

    setIsDeleting(true);
    
    try {
      const response = await removeUrlCustomDomain(domainToDelete.id, force);
      
      if (response.success) {
        toast.success(response.data?.message || t('domainRemoved'));
        setDomainToDelete(null);
        setDeleteImpact(null);
        setShowImpactDialog(false);
        
        // Load domains first to update the state
        await loadDomains();
        
        // Force reload to update userCustomDomain in parent
        onDomainUpdate?.();
      } else {
        if (response.message?.includes('requires confirmation') || (response as any).requiresConfirmation) {
          // Show impact dialog if not already shown
          if (!showImpactDialog) {
            setDeleteImpact((response as any).data);
            setShowImpactDialog(true);
          }
        } else {
          toast.error(response.message || t('errorDeletingDomain'));
        }
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

  const verifyDNS = async (domainId: string) => {
    setCheckingDomains(prev => new Set(prev.add(domainId)));
    
    try {
      const response = await verifyUrlDomainDNS(domainId);
      
      if (response.success) {
        toast.success(response.message || 'DNS verified successfully');
        loadDomains();
      } else {
        toast.error(response.message || 'Error verifying DNS configuration');
      }
    } catch (error) {
      console.error('Error verifying DNS:', error);
      toast.error('Error verifying DNS configuration');
    } finally {
      setCheckingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domainId);
        return newSet;
      });
    }
  };

  const retrySSLConfiguration = async (domainId: string) => {
    setRetryingDomains(prev => new Set(prev.add(domainId)));
    
    try {
      const response = await retryUrlDomainSSL(domainId);
      
      if (response.success) {
        toast.success(response.message || 'SSL configuration started');
        loadDomains();
      } else {
        toast.error(response.message || 'Error retrying SSL configuration');
      }
    } catch (error) {
      console.error('Error retrying SSL:', error);
      toast.error('Error retrying SSL configuration');
    } finally {
      // Don't remove from retryingDomains here - let the interval handle it
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
      case 'ssl_pending':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'dns_configured':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('domains.status.pending');
      case 'dns_configured':
        return t('domains.status.dnsConfigured');
      case 'ssl_issued':
        return t('domains.status.sslIssued');
      case 'ssl_pending':
        return t('domains.status.sslPending');
      case 'active':
        return t('domains.status.active');
      case 'failed':
        return t('domains.status.failed');
      case 'removed':
        return t('domains.status.removed');
      default:
        return t('domains.status.error');
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
              <div className="bg-gradient-to-br from-green-900/20 via-emerald-900/15 to-blue-900/20 border border-green-500/30 rounded-xl p-4 sm:p-6 mb-6">
                {/* Header section */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-500/20 p-2 rounded-lg flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <h4 className="text-white font-semibold text-base sm:text-lg">
                      🎉 {t('availableDomains.title')}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {t('availableDomains.description')}
                  </p>
                </div>

                {/* How it works section */}
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 sm:p-4 mb-4">
                  <h5 className="text-blue-200 font-medium mb-3 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 text-xs font-bold">?</span>
                    </div>
                    {t('availableDomains.howItWorks.title')}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-blue-300/80">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 font-bold">1.</span>
                      <span>{t('availableDomains.howItWorks.step1')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 font-bold">2.</span>
                      <span>{t('availableDomains.howItWorks.step2')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 font-bold">3.</span>
                      <span>{t('availableDomains.howItWorks.step3')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 font-bold">4.</span>
                      <span>{t('availableDomains.howItWorks.step4')}</span>
                    </div>
                  </div>
                </div>

                {/* Benefits section */}
                <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3 sm:p-4 mb-4">
                  <h5 className="text-purple-200 font-medium mb-3 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-purple-400 text-sm sm:text-base">✨</span>
                    {t('availableDomains.benefits.title')}
                  </h5>
                  <ul className="text-xs sm:text-sm text-purple-300/80 space-y-2 sm:space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span>{t('availableDomains.benefits.noDnsSetup')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span>{t('availableDomains.benefits.instantActivation')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                      <span>{t('availableDomains.benefits.dualPurpose')}</span>
                    </li>
                  </ul>
                </div>
                
                {/* Available domains list */}
                <div className="space-y-3">
                  <h5 className="text-white font-medium text-sm mb-3">
                    {t('availableDomains.listTitle')}
                  </h5>
                  {availableDomains.map((domain) => (
                    <div key={domain.id} className="bg-[#1c1033]/80 border border-gray-600/50 rounded-lg p-3 sm:p-4 hover:border-green-500/30 transition-all duration-200">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                          <div className="flex-1 min-w-0">
                            {/* Domain name and icon on same line */}
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                              </div>
                              <div className="text-white font-semibold text-sm sm:text-base break-all">
                                {domain.domain}
                              </div>
                            </div>
                            
                            {/* Badges and example URL in compact layout */}
                            <div className="flex flex-col gap-1">
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full border border-green-600/30 w-fit">
                                  <span className="hidden sm:inline">✓ {t('availableDomains.readyToUse')}</span>
                                  <span className="sm:hidden">✓ {t('availableDomains.readyToUse')}</span>
                                </span>
                                <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-600/30 w-fit">
                                  <span className="hidden sm:inline">🔗 {t('sharedDomainInfo')}</span>
                                  <span className="sm:hidden">🔗 {t('sharedDomainInfo')}</span>
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 break-all">
                                {t('availableDomains.urlExample', { domain: domain.domain })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 sm:self-center">
                            <Button
                              size="sm"
                              onClick={() => activateDomain(domain.id)}
                              disabled={activatingDomains.has(domain.id)}
                              className="w-full sm:w-auto h-8 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold rounded-lg shadow-lg shadow-yellow-900/30 transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm"
                            >
                              {activatingDomains.has(domain.id) ? (
                                <div className="flex items-center gap-1.5">
                                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                  <span className="hidden sm:inline">{t('activating')}</span>
                                  <span className="sm:hidden">{t('activating')}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="hidden sm:inline">{t('activateDomain')}</span>
                                  <span className="sm:hidden">{t('activateDomain')}</span>
                                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                              )}
                            </Button>
                          </div>
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

        {/* Add new domain - Only show if no active domain exists */}
        {!domains.some(domain => domain.status === 'active') && (
          <div className="space-y-6">
          {/* Header section */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-2">
              {t('addSection.title')}
            </h4>
            <p className="text-sm text-gray-400">
              {t('addSection.subtitle')}
            </p>
          </div>

          {/* Input section with improved design */}
          <div className="bg-gradient-to-br from-[#1a0b2e] to-[#2c1b4d] rounded-xl p-6 border border-purple-500/20">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('addSection.domainLabel')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder={t('addSection.domainPlaceholder')}
                      className="pl-10 h-14 bg-[#120724] border-gray-600 text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 rounded-lg text-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoading && newDomain.trim()) {
                          addDomain();
                        }
                      }}
                    />
                  </div>
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-400">
                      {t('addSection.domainExamples')}
                    </p>
                    
                    {/* Recomendación de dominios .link */}
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-500/20 p-1.5 rounded-md flex-shrink-0 mt-0.5">
                          <svg className="h-3 w-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-blue-200 font-medium text-xs mb-1">
                            {t('addSection.recommendations.linkDomains.title')}
                          </h5>
                          <p className="text-blue-300/80 text-xs leading-relaxed">
                            {t('addSection.recommendations.linkDomains.description')}
                          </p>
                          <p className="text-blue-400/70 text-xs mt-1">
                            {t('addSection.recommendations.linkDomains.availability')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center lg:min-w-[200px]">
                  <Button 
                    onClick={addDomain}
                    disabled={isLoading || !newDomain.trim()}
                    className="h-14 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold rounded-lg transition-all duration-200 shadow-lg shadow-yellow-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>{t('addSection.adding')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <ArrowRight className="h-5 w-5" />
                        <span>{t('addSection.addButton')}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview section */}
            {newDomain.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="mt-4 p-4 bg-[#120724]/50 rounded-lg border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">{t('addSection.previewLabel')}</p>
                  <p className="text-sm font-mono text-blue-300">
                    {newDomain}/mi-enlace
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Requirements section */}
          <div className="bg-amber-900/10 border border-amber-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h5 className="text-amber-200 font-medium mb-2">
                  📋 {t('addSection.requirements.title')}
                </h5>
                <ul className="text-sm text-amber-300/80 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{t('addSection.requirements.ownership')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{t('addSection.requirements.dnsAccess')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{t('addSection.requirements.timeRequired')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Steps preview */}
          <div className="bg-blue-900/10 border border-blue-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                <div className="h-5 w-5 text-blue-400 font-bold text-sm flex items-center justify-center">
                  1
                </div>
              </div>
              <div>
                <h5 className="text-blue-200 font-medium mb-2">
                  🚀 {t('addSection.nextSteps.title')}
                </h5>
                <p className="text-sm text-blue-300/80">
                  {t('addSection.nextSteps.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

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
                <div className="flex flex-col gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {getStatusIcon(domain.status, domain.id)}
                    <span className="text-white font-medium truncate flex-1">{domain.domain}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveDomain(domain)}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-800/50 p-1.5"
                        title={t('deleteModal.subtitle')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {domain.supports_landing && (
                    <div className="flex">
                      <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded inline-block">
                        {t('sharedDomainInfo')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Acciones principales */}
                    <div className="flex gap-2">
                      {domain.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyDNS(domain.id)}
                          disabled={checkingDomains.has(domain.id)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {checkingDomains.has(domain.id) ? t('domains.buttons.verifyingDns') : t('domains.buttons.verifyDns')}
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
                      {domain.status === 'dns_configured' && !retryingDomains.has(domain.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retrySSLConfiguration(domain.id)}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          {t('domains.buttons.configureSSL')}
                        </Button>
                      )}
                      {(domain.status === 'failed' || domain.status === 'removed' || domain.error_message) && domain.status !== 'active' && domain.status !== 'pending' && domain.status !== 'dns_configured' && !retryingDomains.has(domain.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryDomain(domain.id)}
                          className="text-xs text-yellow-400 hover:text-yellow-300"
                        >
                          {t('retry')}
                        </Button>
                      )}
                      {domain.status === 'ssl_pending' && !retryingDomains.has(domain.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => checkDomainStatus(domain.id, true)}
                          disabled={checkingDomains.has(domain.id)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {checkingDomains.has(domain.id) ? t('checking') : t('domains.buttons.verifySSL')}
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
                    </div>
                    
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
                            <span>142.93.40.80</span>
                            <button 
                              onClick={() => copyToClipboard('142.93.40.80')}
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
                            <span className="font-medium">_creator0x-verify</span>
                            <button 
                              onClick={() => copyToClipboard('_creator0x-verify')}
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
                        {t('dnsInstructions.finalNote').replace('{domain}', domain.domain)}
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
      <AlertDialog open={!!domainToDelete && !showImpactDialog} onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setDomainToDelete(null);
          setDeleteImpact(null);
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {t('deleteModal.title')}
                </div>
                <div className="text-sm text-gray-400 font-normal">
                  {domainToDelete?.domain}
                </div>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-200 font-medium mb-1">
                      ⚠️ {t('deleteModal.subtitle')}
                    </p>
                    <p className="text-yellow-300/80">
                      {t('deleteModal.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-300">
                <p className="mb-2">
                  <strong>{t('deleteModal.whatWillHappen')}</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 ml-2">
                  <li>{t('deleteModal.consequences.domainWillStop')}</li>
                  <li>{t('deleteModal.consequences.urlsWillChange')}</li>
                  <li>{t('deleteModal.consequences.reconfigureRequired')}</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              {t('deleteModal.cancelButton')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemoveDomain()}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t('deleteModal.deleting')}
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('deleteModal.confirmButton')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Impact Warning Dialog */}
      <AlertDialog open={showImpactDialog} onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setShowImpactDialog(false);
          setDomainToDelete(null);
          setDeleteImpact(null);
        }
      }}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  ⚠️ {t('impactModal.title')}
                </div>
                <div className="text-sm text-gray-400 font-normal">
                  {deleteImpact?.domain?.domain}
                </div>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              {deleteImpact && (
                <>
                  <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-orange-200 font-medium mb-1">
                          {t('impactModal.domainInUse')}
                        </p>
                        <p className="text-orange-300/80">
                          {t('impactModal.willStopWorking')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {deleteImpact.affectedUrls?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">{t('impactModal.affectedUrls')}</p>
                      <div className="bg-gray-800/50 rounded-lg p-3 max-h-32 overflow-y-auto border border-gray-700/50">
                        {deleteImpact.affectedUrls.slice(0, 5).map((url: any, index: number) => (
                          <div key={index} className="text-xs text-gray-400 mb-1 font-mono">
                            <span className="text-orange-300">{deleteImpact.domain?.domain}</span>
                            <span className="text-gray-500">/</span>
                            <span className="text-blue-300">{url.slug}</span>
                          </div>
                        ))}
                        {deleteImpact.affectedUrlsCount > 5 && (
                          <div className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
                            {t('impactModal.moreUrls', { count: deleteImpact.affectedUrlsCount - 5 })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-400 mt-0.5">💡</div>
                      <div className="text-sm">
                        <p className="text-blue-200 font-medium mb-1">
                          {t('impactModal.dontWorry')}
                        </p>
                        <p className="text-blue-300/80">
                          {t('impactModal.willStillWork')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {deleteImpact.canDeactivateOnly && (
                    <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="text-purple-400 mt-0.5">ℹ️</div>
                        <div className="text-sm">
                          <p className="text-purple-200 font-medium mb-1">
                            {t('impactModal.sharedDomain')}
                          </p>
                          <p className="text-purple-300/80">
                            {t('impactModal.sharedDomainDescription')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              {t('impactModal.cancelButton')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemoveDomain(true)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t('impactModal.removing')}
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('impactModal.confirmButton')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}