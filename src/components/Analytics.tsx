import Script from "next/script";

/** Loads Microsoft Clarity and Google Analytics 4 only when their IDs are set in the environment. */
export function Analytics() {
  const clarity = process.env.NEXT_PUBLIC_CLARITY_ID;
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      {clarity ? (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarity)});`}
        </Script>
      ) : null}
      {ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga)});`}
          </Script>
        </>
      ) : null}
    </>
  );
}
