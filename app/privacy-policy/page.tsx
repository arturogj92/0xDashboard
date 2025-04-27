'use client';

import React from 'react';
import PrivacyLinks from '../components/PrivacyLinks';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#120724] rounded-lg shadow-lg p-8 border border-indigo-900/30">
        <h1 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Política de Privacidad</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Introducción</h2>
          <p className="text-gray-300 mb-4">
            En 0xReplyer, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política de privacidad explica cómo recopilamos, utilizamos y protegemos su información personal cuando utiliza nuestra plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Información que Recopilamos</h2>
          <p className="text-gray-300 mb-4">
            Recopilamos la siguiente información:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Comentarios públicos de Facebook</li>
            <li>Palabras clave para el seguimiento</li>
            <li>Respuestas generadas a comentarios</li>
            <li>Registros de mensajes directos enviados</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">3. Uso de la Información</h2>
          <p className="text-gray-300 mb-4">
            Utilizamos la información recopilada para:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Analizar el rendimiento de las respuestas</li>
            <li>Optimizar la gestión de comentarios</li>
            <li>Mantener registros de comunicación</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">4. Almacenamiento de Datos</h2>
          <p className="text-gray-300 mb-4">
            No persistimos información personal de los usuarios. Los datos se almacenan de forma segura y se utilizan únicamente para el funcionamiento del servicio. Mantenemos registros de:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Comentarios públicos y sus respuestas</li>
            <li>Palabras clave configuradas</li>
            <li>Registros de mensajes directos enviados</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">5. Protección de Datos</h2>
          <p className="text-gray-300 mb-4">
            Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Encriptación de datos en reposo y en tránsito</li>
            <li>Acceso restringido a la información</li>
            <li>Monitoreo regular de seguridad</li>
            <li>Cumplimiento de normativas de protección de datos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">6. Sus Derechos</h2>
          <p className="text-gray-300 mb-4">
            Como usuario, tiene derecho a:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Acceder a su información</li>
            <li>Solicitar la corrección de datos inexactos</li>
            <li>Solicitar la eliminación de sus datos</li>
            <li>Oponerse al procesamiento de sus datos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">7. Contacto</h2>
          <p className="text-gray-300 mb-4">
            Si tiene preguntas sobre esta política de privacidad o sobre cómo manejamos sus datos, puede contactarnos a través de:
          </p>
          <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-800/30">
            <p className="text-indigo-300 font-medium">
              Email: elcaminodelprogramadorweb@gmail.com
            </p>
          </div>
        </section>

        <footer className="mt-12 border-t border-indigo-900/30 pt-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-gray-400">Última actualización: {new Date().toLocaleDateString()}</p>
            <PrivacyLinks />
          </div>
        </footer>
      </div>
    </div>
  );
} 