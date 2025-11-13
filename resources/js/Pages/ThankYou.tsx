import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Sun, ArrowRight } from 'lucide-react';

interface ThankYouProps {
  hasAccount: boolean;
}

export default function ThankYou({ hasAccount }: ThankYouProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect after countdown
          window.location.href = hasAccount ? '/login' : '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAccount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Head title="Vielen Dank" />

      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Vielen Dank!</CardTitle>
          <CardDescription className="text-lg">
            Ihre Anfrage wurde erfolgreich übermittelt
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {hasAccount ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-start">
                  <Sun className="h-6 w-6 text-blue-600 dark:text-blue-300 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Ihr Benutzerkonto wurde erstellt!
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Wir haben Ihnen eine E-Mail mit Ihren Zugangsdaten geschickt.
                      Bitte prüfen Sie Ihr Postfach (auch im Spam-Ordner).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Was passiert als Nächstes?
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 text-center mr-2 flex-shrink-0">1</span>
                    <span>Prüfen Sie Ihre E-Mails und notieren Sie Ihre Zugangsdaten</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 text-center mr-2 flex-shrink-0">2</span>
                    <span>Melden Sie sich mit Ihren Zugangsdaten an</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 text-center mr-2 flex-shrink-0">3</span>
                    <span>Sehen Sie sich Ihre gespeicherte Solar-Planung an</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 text-center mr-2 flex-shrink-0">4</span>
                    <span>Wir kontaktieren Sie in Kürze für weitere Details</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                  Sie werden in <span className="font-bold text-blue-600">{countdown}</span> Sekunden automatisch zur Login-Seite weitergeleitet...
                </p>
                <Link href="/login" className="block">
                  <Button className="w-full" size="lg">
                    Jetzt anmelden <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Ihre Anfrage wurde gespeichert!
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Vielen Dank für Ihr Interesse an unserer Solar-Lösung.
                      Wir haben Ihre Daten erhalten und werden uns in Kürze bei Ihnen melden.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Was passiert als Nächstes?
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300 text-center mr-2 flex-shrink-0">1</span>
                    <span>Unser Team prüft Ihre Solar-Planung</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300 text-center mr-2 flex-shrink-0">2</span>
                    <span>Wir kontaktieren Sie innerhalb von 24 Stunden</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300 text-center mr-2 flex-shrink-0">3</span>
                    <span>Gemeinsam besprechen wir die nächsten Schritte</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                  Sie werden in <span className="font-bold text-green-600">{countdown}</span> Sekunden automatisch zur Startseite weitergeleitet...
                </p>
                <Link href="/" className="block">
                  <Button className="w-full" size="lg" variant="outline">
                    Zurück zur Startseite <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bei Fragen erreichen Sie uns jederzeit per E-Mail oder Telefon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
