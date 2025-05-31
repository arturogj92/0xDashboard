"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/api';
import { Globe, CheckCircle, XCircle, Clock, AlertCircle, Copy, ExternalLink } from 'lucide-react';

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
}

export default function CustomDomainConfiguration({ landingId, onDomainUpdate }: CustomDomainConfigurationProps) {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState<string | null>(null);

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
  }, [landingId]);

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
      } else {
        const error = await response.json();
        alert(error.message || 'Error adding domain');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      alert('Error adding domain');
    } finally {
      setIsLoading(false);
    }
  };

  const removeDomain = async (domainId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este dominio?')) return;

    try {
      const response = await fetch(`${API_URL}/api/custom-domains/${domainId}`, {
        method: 'DELETE',
        headers: createAuthHeaders()
      });

      if (response.ok) {
        setDomains(prev => prev.filter(d => d.id !== domainId));
        onDomainUpdate?.();
      }
    } catch (error) {
      console.error('Error removing domain:', error);
    }
  };

  const verifyDomain = async (domainId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/custom-domains/${domainId}/verify`, {
        method: 'POST',
        headers: createAuthHeaders()
      });

      if (response.ok) {
        loadDomains(); // Reload to get updated status
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string, sslStatus?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
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
        return 'Pendiente de configuración DNS';
      case 'dns_configured':
        return 'DNS configurado, generando certificado SSL...';
      case 'ssl_issued':
        return 'Certificado SSL emitido, activando...';
      case 'active':
        return 'Dominio activo y funcionando';
      case 'failed':
        return 'Error en la configuración';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-700/50 rounded-lg p-6 bg-gray-800/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Dominio Personalizado</h3>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Conecta tu propio dominio (ej: midominio.com) para que tus visitantes puedan acceder 
          a tu landing page desde tu URL personalizada.
        </p>

        {/* Add new domain */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="ej: midominio.com"
              className="flex-1 bg-gray-900/50 border-gray-600 text-white"
            />
            <Button 
              onClick={addDomain}
              disabled={isLoading || !newDomain.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Agregando...' : 'Agregar Dominio'}
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            ⚠️ Asegúrate de que el dominio te pertenece y tienes acceso a su configuración DNS
          </div>
        </div>

        {/* Existing domains */}
        {domains.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="text-white font-medium">Dominios configurados:</h4>
            
            {domains.map((domain) => (
              <div key={domain.id} className="border border-gray-600 rounded-lg p-4 bg-gray-900/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(domain.status, domain.ssl_status)}
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
                        Verificar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeDomain(domain.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-3">
                  {getStatusText(domain.status, domain.ssl_status)}
                </p>

                {domain.error_message && (
                  <div className="text-sm text-red-400 mb-3 p-2 bg-red-900/20 rounded">
                    Error: {domain.error_message}
                  </div>
                )}

                {/* DNS Instructions */}
                {domain.status === 'pending' && (
                  <div className="bg-gray-800/40 rounded-lg p-4 space-y-3">
                    <h5 className="text-white font-medium text-sm">
                      Configuración DNS requerida:
                    </h5>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Tipo:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-700 px-2 py-1 rounded">
                            {domain.verification_type.toUpperCase()}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(domain.verification_type.toUpperCase())}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Nombre:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-700 px-2 py-1 rounded">
                            {domain.verification_type === 'txt' ? '_creator0x-verification' : '@'}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(domain.verification_type === 'txt' ? '_creator0x-verification' : '@')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Valor:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-700 px-2 py-1 rounded max-w-40 truncate">
                            {domain.verification_type === 'txt' 
                              ? domain.verification_token 
                              : 'vps.creator0x.com'
                            }
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(
                              domain.verification_type === 'txt' 
                                ? domain.verification_token 
                                : 'vps.creator0x.com'
                            )}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-900/40 p-3 rounded">
                      <strong>Instrucciones:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Ve al panel de control de tu proveedor de dominios</li>
                        <li>Busca la sección de "DNS" o "Zona DNS"</li>
                        <li>Agrega el registro DNS con los valores mostrados arriba</li>
                        <li>Espera a que se propague (puede tomar hasta 24 horas)</li>
                        <li>Haz clic en "Verificar" para confirmar la configuración</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}