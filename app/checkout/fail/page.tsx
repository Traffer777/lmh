import Link from "next/link";

export const metadata = { title: "Оплата не прошла — LMH" };

export default async function FailPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center md:px-6">
      <div className="mono text-xs uppercase tracking-[0.3em] text-fg-dim">Упс</div>
      <h1 className="display mt-3 text-5xl">Оплата не завершена</h1>
      <p className="mt-4 text-fg-dim">
        {order ? (
          <>
            Заказ <span className="mono text-fg">№ {order}</span> создан, но оплата не прошла.
            Вы можете повторить попытку или связаться с нами.
          </>
        ) : (
          "Оплата не прошла. Попробуйте ещё раз или свяжитесь с нами."
        )}
      </p>
      <div className="mt-10 flex justify-center gap-3">
        <Link href="/cart" className="btn btn-accent">
          Вернуться в корзину
        </Link>
        <a href="https://t.me/LmhFuckSleep" className="btn" target="_blank" rel="noreferrer">
          Написать в Telegram
        </a>
      </div>
    </div>
  );
}
