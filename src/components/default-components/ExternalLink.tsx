import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

// Componente para abrir enlaces externos dentro de un navegador integrado (in-app browser).
export function ExternalLink({ href, ...resto }: Props) {
  return (
    <Link
      target="_blank"
      {...resto}
      href={href}
      onPress={async (evento) => {
        if (process.env.EXPO_OS !== 'web') {
          // Previene el comportamiento predeterminado del navegador nativo.
          evento.preventDefault();
          // Abre el enlace en el navegador interno de la aplicación.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}
