'use client';

import React from 'react';
import PrivacyLinks from '../components/PrivacyLinks';

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#120724] rounded-lg shadow-lg p-8 border border-indigo-900/30">
        <h1 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Solicitud de Eliminación de Datos</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Proceso de Eliminación de Datos</h2>
          <p className="text-gray-300 mb-4">
            En 0xReplyer, respetamos su derecho a la privacidad y al control de sus datos personales. Si desea eliminar sus datos de nuestra plataforma, siga estos pasos:
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Datos que se Eliminarán</h2>
          <p className="text-gray-300 mb-4">
            Al solicitar la eliminación de sus datos, se eliminará la siguiente información:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Su cuenta de usuario y configuración</li>
            <li>Historial de comentarios y respuestas</li>
            <li>Palabras clave configuradas</li>
            <li>Registros de mensajes directos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Cómo Solicitar la Eliminación</h2>
          <p className="text-gray-300 mb-4">
            Para solicitar la eliminación de sus datos, puede:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Enviar un correo electrónico a nuestro equipo de soporte</li>
            <li>Utilizar la función de eliminación de cuenta en la configuración de su perfil</li>
            <li>Contactar a nuestro equipo de atención al cliente</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">3. Proceso de Verificación</h2>
          <p className="text-gray-300 mb-4">
            Para proteger su privacidad, requeriremos verificación de su identidad antes de proceder con la eliminación. Esto puede incluir:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Confirmación por correo electrónico</li>
            <li>Verificación de identidad</li>
            <li>Confirmación de la cuenta de Facebook asociada</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">4. Tiempo de Procesamiento</h2>
          <p className="text-gray-300 mb-4">
            Procesaremos su solicitud de eliminación dentro de los siguientes plazos:
          </p>
          <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Eliminación inmediata de acceso a la plataforma</li>
            <li>Eliminación completa de datos dentro de 30 días</li>
            <li>Confirmación por correo electrónico una vez completada la eliminación</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">5. Contacto</h2>
          <p className="text-gray-300 mb-4">
            Si tiene preguntas sobre el proceso de eliminación de datos o necesita asistencia, puede contactarnos a través de:
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