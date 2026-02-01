import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SnookerRules = () => {
  useEffect(() => {
    document.title = "תקנון | ביליארד בית קשת 🎱";
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0c2418 0%, #0a3d24 25%, #0d4a2c 50%, #0a3d24 75%, #0c2418 100%)' }}>
      {/* Felt texture overlay */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-700/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to="/snooker"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה
          </Link>
          <h1 className="text-lg font-bold text-emerald-300">🎱 תקנון</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
        <div className="bg-emerald-900/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-emerald-600/30">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-200 mb-2 text-center">
            🎱 חגיגה בסנוקר – תקנון שימוש
          </h1>
          <p className="text-emerald-400/80 text-center mb-8">
            שולחן הביליארד | בית קשת
          </p>
          
          <div className="space-y-8 text-emerald-100">
            {/* Section: Entry and Key */}
            <section>
              <h2 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                🔐 כניסה ומפתח
              </h2>
              <ul className="space-y-3 text-emerald-200/90 leading-relaxed">
                <li>• הכניסה לרדיו בר היא דרך הדלת הראשית בלבד.</li>
                <li>• המפתח נמצא בלוקבוקס מימין לדלת.</li>
                <li className="font-semibold text-emerald-300">• קוד הלוקבוקס: 8264</li>
              </ul>
            </section>

            {/* Section: Usage Rules */}
            <section>
              <h2 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                📋 כללי שימוש
              </h2>
              <ul className="space-y-3 text-emerald-200/90 leading-relaxed">
                <li>• השימוש בשולחן הביליארד מיועד לתושבי בית קשת בלבד.</li>
                <li>• אין להכניס אורחים ללא ליווי של תושב/ת מהיישוב.</li>
                <li>• הכניסה למתחם מותנית ברישום מראש באפליקציית ההרשמה.</li>
                <li>• יש לרשום באפליקציה את שמות כל המשתתפים; ניתן להירשם ולהוסיף שמות של חברים נוספים.</li>
                <li>• ההרשמה היא לשעה אחת בלבד.</li>
                <li>• במידה ואין נרשמים נוספים לאחר השעה שהוזמנה – ניתן להמשיך ולשחק.</li>
                <li>• השימוש מגיל 18 ומעלה בלבד.</li>
              </ul>
            </section>

            {/* Section: Cleanliness */}
            <section>
              <h2 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                🧹 סדר וניקיון
              </h2>
              <ul className="space-y-3 text-emerald-200/90 leading-relaxed">
                <li>• בסיום המשחק חובה להחזיר את כל הציוד למקום:<br/>
                  <span className="text-emerald-400 mr-4">מקלות, כדורים, משולש, גירים וחמור.</span>
                </li>
                <li>• יש להשאיר את המקום נקי ומסודר לאחר השימוש.</li>
                <li>• כוסות, בקבוקים ושאריות אוכל – לקחת אתכם ולזרוק בפח שמחוץ לרדיו בר.</li>
              </ul>
            </section>

            {/* Section: Smoking */}
            <section>
              <h2 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                🚭 עישון
              </h2>
              <ul className="space-y-3 text-emerald-200/90 leading-relaxed">
                <li>• אין לעשן בתוך הרדיו בר.</li>
                <li>• עישון מותר אך ורק מחוץ למבנה.</li>
              </ul>
            </section>

            {/* Section: End of Stay */}
            <section>
              <h2 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                🔒 בסיום השהות
              </h2>
              <ul className="space-y-3 text-emerald-200/90 leading-relaxed">
                <li>• לכבות את כל האורות ברדיו בר.</li>
                <li>• לנעול את כל הדלתות.</li>
              </ul>
            </section>

            {/* Section: Responsibility */}
            <section>
              <h2 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                ⚠️ אחריות ונזקים
              </h2>
              <ul className="space-y-3 text-emerald-200/90 leading-relaxed">
                <li>• המשחק והשהות ברדיו בר הם באחריות המשתמשים בלבד.</li>
                <li>• יש לדווח על כל נזק שנגרם במהלך השימוש.</li>
                <li>• האחריות לכל נזק שייגרם לציוד או למבנה חלה על המשתמשים.</li>
                <li className="font-semibold text-amber-400">• היישוב והוועד אינם אחראים לנזק, פגיעה או אובדן מכל סוג שהוא.</li>
              </ul>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link to="/snooker/register">
              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white"
              >
                קראתי ומאשר/ת – להרשמה
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SnookerRules;
